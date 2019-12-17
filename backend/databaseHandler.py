import dateutil.parser
import logging
import numpy as np
import pandas as pd
import re
import sys
import traceback
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request, redirect, Response
from json import dumps, load
from os import path
from requests import post as post_request
from sodapy import Socrata
from sqlalchemy import create_engine, inspect, text
import sqlalchemy

# Constants
# Crime database...
_crime_api_uri="https://data.baltimorecity.gov/resource/wsfq-mvij.json"
CRIME_DATABASE_URL = "data.baltimorecity.gov"
CRIME_DATABASE_UID = "wsfq-mvij"
CRIME_DATABASE_DATA_FORMAT = ".json"

# Socrata
SOCRATA_API_KEY = 'QIp1Jkf0zTvXH0jc2j8xMoRim'

# Real estate market value...
RE_DATABASE_URL = "https://geodata.baltimorecity.gov/egis/rest/services/CityView/Realproperty/MapServer/0/query/"
RE_DATABASE_COLS = ['OBJECTID', 'TAXBASE', 'BFCVLAND', 'BFCVIMPR', 'LANDEXMP', 'IMPREXMP', 'PERMHOME', 'CURRLAND', 'CURRIMPR', 'EXMPLAND', 'EXMPIMPR', 'FULLCASH', 'ARTAXBAS', 'SALEDATE', 'SALEPRIC', 'YEAR_BUILD', 'OWNMDE', 'VACIND', 'STDIRPRE', 'ST_NAME', 'ST_TYPE', 'BLDG_NO']

# related to the local SQL database
CRIME_TABLE_NAME = 'crime'
REALESTATE_TABLE_NAME = 'realestate'

SQL_DATABASE_FILE_NAME = 'crime.db'
SQL_DATABASE_URI = 'sqlite:///' + SQL_DATABASE_FILE_NAME

LAST_FULL_DB_UPDATE_FILENAME = 'LAST_DB_UPDATE_TIMESTAMP'

# the database engine
DATABASE = None

def updateDB():
    """
    Imports the entire database from the URI, cleans the data, and puts it into
    the local database.
    """
    global DATABASE

    # IMPORT DATABASE
    if DATABASE is None:
        DATABASE = create_engine(SQL_DATABASE_URI, convert_unicode=True)
    
    temp = datetime.strptime("1970-01-01 00:00:00.000", "%Y-%m-%d %H:%M:%S.%f")
    """
    HOTFIX: DISABLING DATABASE UPDATING BECAUSE SHITS FUCKED YO
    # Get the time the database was last updated
    if path.exists(LAST_FULL_DB_UPDATE_FILENAME): 
        f = open(LAST_FULL_DB_UPDATE_FILENAME,'r')
        contents = f.read()
        try:
            temp = datetime.strptime(contents, "%Y-%m-%d %H:%M:%S.%f")
        except:
            temp = datetime.strptime("1970-01-01 00:00:00.000", "%Y-%m-%d %H:%M:%S.%f")

    # if the last update was over a day ago, do the update
    if temp + timedelta(days=1) < datetime.now():
        update_crime_table()
        update_realestate_table()
        with open(LAST_FULL_DB_UPDATE_FILENAME,'w') as f:
            f.write(str(datetime.now()))
    else:
        logging.info("The db's do not need updating right now, as they were last updated on: {}".format(str(temp)))
    """
    # Print out the current database formatting
    debugging_output = ""
    for table in inspect(DATABASE).get_table_names():
        debugging_output += "\n****Table Name: " + table + " ****\n"
        for name in inspect(DATABASE).get_columns(table):
            debugging_output += "\n" + name['name'] + " | " + str(name['type'])
        debugging_output += "\nTOTAL ROWS IN TABLE: " + table + ": \t" + str(DATABASE.connect().execute("SELECT COUNT({}) FROM {}".format(inspect(DATABASE).get_columns(table)[0]['name'], table)).fetchall()[0][0])
    logging.warn(debugging_output)
    

def update_crime_table():
    """
    Updates the crime reports table and inserts it into the database file (replacing an existing table of the same name).
    """
    logging.warn("UPDATING CRIME REPORTS TABLE")
    results = None
    # authenticated client with api token
    try:
        client = Socrata(CRIME_DATABASE_URL, SOCRATA_API_KEY)
        if not isinstance(client, Socrata):
            logging.error("Failed to create Socrata object to receive crime database")
            client.close()
            return
        # First 10000000 results, as a python dictionary version of the JSON from API
        results = client.get(CRIME_DATABASE_UID, limit=10000000)
        client.close()
    except Exception as e:
        logging.error('Fatal error when attempting to retreive crime database\n' + traceback.format_exception_only(*sys.exc_info()[0:2])[0])
        
    if results is None or len(results) < 1:
        logging.error("received no data from the crime database")
        return
    # Convert to pandas DataFrame
    database = pd.DataFrame.from_records(results)
    
    # CLEAN DATA
    # manually converting all instances of "NA" in the "Weapon" column to NaN
    # so that program can properly handle it for any calculations
    database['weapon'] = database['weapon'].replace("NA", np.nan)

    # fixing some formatting inconsistencies
    database['inside_outside'] = database['inside_outside'].replace("(?i)outside", "O",regex=True)
    database['inside_outside'] = database['inside_outside'].replace("(?i)inside", "I",regex=True)

    database['crimedate'] = pd.to_datetime(database['crimedate'],format="%Y-%m-%dT%H:%M:%S.%f")
    

    #clear out any special funny chars so we can clean the requested data
    database = database.replace("[#\"\'_;]", "",regex=True)
    database = database.astype({"longitude":float, "latitude":float, "total_incidents":float })
    database.to_sql(CRIME_TABLE_NAME, con=DATABASE, index=True, index_label='id', if_exists='replace')
    logging.info([" ".join([str(x['name']),str(x['type'])]) for x in inspect(DATABASE).get_columns(CRIME_TABLE_NAME)])

def update_realestate_table():
    """
    Updates the realestate market values table
    """
    # TODO if we hit an out of memory error around here, we should fix how we read in the data
    # TODO should prob check to make sure we dont ge r
    logging.warn("UPDATING REALESTATE DB")
    max_req = 1001
    where_stmt = "1=1"
    if_exists = 'replace'       # replace current database on the first iteration
    # do while loop
    while True:
        # get all the records

        data = {
            'where':where_stmt,                         # get a specific set of rows
            'outFields':", ".join(RE_DATABASE_COLS),    # get specific columns
            'returnGeometry':True,                      # do get the extra geometry for geolocation stuff
            'outSR':4286,                               # get coordinate values
            'f':'json',                                 # TODO: update to GEOjson format?
            'units':'esriSRUnit_StatuteMile',           # 1 mile unit
            'resultRecordCount':max_req,                # the number of records to request at this time
            'orderByFields':'OBJECTID'                  # the field to be sorted by
            }
        # make the request. Because we do a post request, this should return the entire database in one go
        db_request = None
        try:
            db_request = post_request(url = RE_DATABASE_URL, data = data)
        except Exception as e:
            logging.error('Fatal error when attempting to retreive realestate database\n' + traceback.format_exception_only(*sys.exc_info()[0:2])[0])
            return

        # double check the return values
        if 'json' in db_request.headers.get('Content-Type'):
            results = db_request.json()
        else:
            logging.error('Realestate database request content is not in JSON format.')
            return

        # ensure we received data and have not received all of the data yet
        if results.get('error', False) or len(results['features']) == 0 or not results.get('exceededTransferLimit', True):
            break
        else:

            temp_table = [x['attributes'] for x in results['features']]
            
            last_id = temp_table[-1]['OBJECTID']
            logging.warn("RECEIVED REALESTATE ID's: " + str(temp_table[0]['OBJECTID']) + " -> " + str(last_id))

            # append the geometry into the the array as its own dict item
            coords_table = [x['geometry']['rings'] for x in results['features']]
            i = 0
            for group in coords_table:
                groupavg = [0,0]
                for pair in group:
                    for row in pair:
                        groupavg[0] += row[0]
                        groupavg[1] += row[1]
                temp_table[i]['longitude'] = groupavg[0]/len(pair)
                temp_table[i]['latitude'] = groupavg[1]/len(pair)
                i += 1
            
            temp_database = pd.DataFrame.from_records(temp_table, index="OBJECTID", columns=RE_DATABASE_COLS)
            
            # clean table values
            temp_database['ST_NAME'] = temp_database['ST_NAME'].str.strip()
            temp_database['BLDG_NO'] = temp_database['BLDG_NO'].replace(np.nan,0)
            
            # create a column for the estimated realestate value 
            temp_database['est_value'] = temp_database.apply(lambda row: 
                max(row.TAXBASE, row.ARTAXBAS, row.FULLCASH, row.SALEPRIC,
                    sum([x if x is not None else 0 for x in [row.BFCVLAND,row.BFCVIMPR]]), 
                    sum([x if x is not None else 0 for x in [row.LANDEXMP,row.IMPREXMP]]), 
                    sum([x if x is not None else 0 for x in [row.CURRLAND,row.CURRIMPR]]), 
                    sum([x if x is not None else 0 for x in [row.EXMPLAND,row.EXMPIMPR]])
                    )
                , axis=1)

            # remove the unnecessary cols
            temp_database = temp_database.drop(["TAXBASE", "ARTAXBAS", "BFCVLAND", "BFCVIMPR", "LANDEXMP" , "IMPREXMP", "CURRLAND", "CURRIMPR", "EXMPLAND", "EXMPIMPR", "FULLCASH", "SALEPRIC"], axis=1)

            temp_database['YEAR_BUILD'] = temp_database['YEAR_BUILD'].replace(0, np.nan)
            temp_database['SALEDATE'] = pd.to_datetime(temp_database['SALEDATE'], errors='coerce', infer_datetime_format=True, format="%m%d%Y")
            #temp_database['SALEDATE'] = temp_database['SALEDATE'].replace('NaT', np.nan)

            # rename column headers
            temp_database = temp_database.rename(columns={'PERMHOME': 'perm_home' , 'SALEDATE': 'date_sold' , 'YEAR_BUILD': 'year_built', 'OWNMDE': 'owner_mode' , 'VACIND':'vacant' , 'STDIRPRE': 'addr_prefix' , 'ST_NAME': 'addr_name' , 'ST_TYPE': 'addr_suffix' , 'BLDG_NO': 'addr_num'}, errors='raise')
    
            # add to sql database
            temp_database = temp_database.astype({"addr_num":int })
            temp_database.to_sql(REALESTATE_TABLE_NAME, con=DATABASE, index=True, index_label='uid', if_exists=if_exists)

            # setup vars for next loop. 
            # make all following writes append and not replace
            if_exists = 'append'
            # setup the next query statement
            where_stmt = "OBJECTID > {} AND OBJECTID < {}".format(last_id, last_id+max_req)

        logging.info([" ".join([str(x['name']),str(x['type'])]) for x in inspect(DATABASE).get_columns(REALESTATE_TABLE_NAME)])
    else:
        logging.error('Missing realestate data')
    

def is_valid_filter_tables(name):
    """
    :param name: The name to check
    :returns: True if the table names given exist inside the database, and the database exists. Otherwise, False
    """
    if DATABASE and name in DATABASE.table_names():
        return True
    return False
    

def is_valid_db_header(table, key):
    """
    :returns: True if the key is a valid database column header name, otherwise False
    """
    return key in [col["name"] for col in inspect(DATABASE).get_columns(table)]

def is_clean_filter_request(filters):
    """
    :returns: True if the values of the filters are clean, otherwise False 
    """
    # valid values are non sql type words
    # valid filter types: 
    # TODO: should prob check to make sure that before and after is a single value, and that is is a list
    valid_filter_keys = ["before","after","is","near","radius"]
    invalid_chars = ['#','\"','\'','_',';']
    for key in filters:
        if str(key) not in valid_filter_keys:
            return False
        elif type(filters[key]) is list:
            for option in filters[key]:
                if type(option) is str and any((c in invalid_chars) for c in option):
                    return False
            if len(filters[key]) == 0:
                return False
        elif type(filters[key]) is str and any((c in invalid_chars) for c in filters[key]):
            return False
    return True

def get_expected_type(table, key):
    """
    Gets the column datatype in order to help the convert_reqest_to_sql to use the correct format when requesting from the database
    :param table: the db table name
    :param key: the column key name to check
    :returns: The type of the column for the given key in the specified table, or None if the column key does not exist 
    """
    for col in inspect(DATABASE).get_columns(table):
       if col['name'] == key:
           return col['type']
    return None

def convert_reqest_to_sql(filters):
    """
    :arg: filters A dictionary with the expected filters
    :returns: a statements dictionary and a paramters dictionary, and an error statement if one occurred
    """
    statements = {}
    params = {}
    try:
        for table_name in filters.keys():
            if not is_valid_filter_tables(table_name):
                return statements, params, "Invalid table requested: " + str(table_name)

            if len(filters[table_name]) == 0:
                return statements, params, "No filters given"

            stmt = "SELECT * FROM " + table_name 
            where = ""
            params[table_name] = {}
            for cols in filters[table_name]:
                # validate this filter
                if cols == "limit":
                    continue
                if not is_valid_db_header(table_name, cols):
                    return statements, params, "Invalid table key: " + str(cols)
                if not is_clean_filter_request(filters[table_name][cols]):
                    return statements, params, "Invalid value sent for key: " + str(cols) + " -> " + str(filters[table_name][cols])
                
                # get the values
                before = filters[table_name][cols].get("before", None)
                after = filters[table_name][cols].get("after", None)
                ls = filters[table_name][cols].get("is", None)
                
                # create the `where` part of the sql statment based on the filters given 
                expected_type = get_expected_type(table_name, cols).python_type
                

                if 'after' in filters[table_name][cols].keys():
                    paramname = str(cols) + "_after"
                    where += str(cols) + " >= :" + paramname
                    if expected_type is datetime:
                        params[table_name][paramname] = dateutil.parser.parse(after)
                    else:
                        params[table_name][paramname] = after
                    if 'before' in filters[table_name][cols].keys():
                        where += " AND "

                if 'before' in filters[table_name][cols].keys():
                    paramname = str(cols) + "_before"
                    where += str(cols) + " <= :" + paramname
                    if expected_type is datetime:
                        params[table_name][paramname] = dateutil.parser.parse(before)
                    else:
                        params[table_name][paramname] = before
                
                if 'is' in filters[table_name][cols].keys() and len(filters[table_name][cols]['is']) > 0:
                    # convert the is to be in the format of: ' col IN (val1, val2, ..., valN) and also replace None with NULL    
                    non_null_vals = tuple([i for i in filters[table_name][cols]['is'] if i is not None])
                    if len(non_null_vals) > 0:
                        non_null_vals = str(non_null_vals).replace(",)",")")
                    else:
                        non_null_vals = ""
                    if None in filters[table_name][cols]['is']:
                        if not(non_null_vals is ""):
                            non_null_vals = "{cols} IN {nnv} OR".format(cols=str(cols), nn=non_null_vals)
                        where += "({nnv} {cols} IS NULL)".format(nnv=non_null_vals, cols=str(cols))
                    else:
                        where += " {} IN {} ".format(str(cols), non_null_vals)

                if len(where) > 0:
                    # `and`, to intersect with the next filter
                    where += " AND "

            if len(where) > 5:
                statements[table_name] = stmt + " WHERE " + where[:-5]
            else:
                statements[table_name] = stmt

        
        return statements, params, None

    except Exception as e:
        err_msg = "Something went wrong while attempting to convert the request into an sql statement\n"
        logging.error(err_msg + traceback.format_exception_only(*sys.exc_info()[0:2])[0])
        return None, None, err_msg

# The blueprint
dbBlueprint = Blueprint('db', __name__)

@dbBlueprint.route("/db/filter/", methods=['GET','POST'])
def db_filterdata():
    """
    :returns: the filtered data corresponding to the requested filter
    """
    # TODO: Remove this silly return of readme when production
    if request.method != 'POST':
        f = open('README.md','r')
        readme = f.read()
        f.close()
        return Response(readme, mimetype='text/plain')
    else:
            
        # get post request data as json
        filter_request = request.get_json()
        logging.error(filter_request)
        # data validation
        if type(filter_request) is not dict:
            return jsonify(error=str("Invalid request, requires a dictionary set"))
        
        if len(filter_request.keys()) == 0:
            return jsonify(error=str("No filters requested"))

        sql_stmts, params, err = convert_reqest_to_sql(filter_request)

        if err is not None:
            logging.error(err)
            return jsonify(error=str(err))

        if DATABASE:
            conn = DATABASE.connect()
            try: 
                json_results = {}
                for tbl_filter in sql_stmts.keys():
                    limit = filter_request[tbl_filter].get('limit',None)
                    if limit is not None and type(limit) is int:
                        result = conn.execute(text(sql_stmts[tbl_filter]).bindparams(**params[tbl_filter])).fetchmany(limit)
                    else:
                        result = conn.execute(text(sql_stmts[tbl_filter]).bindparams(**params[tbl_filter])).fetchall()

                    logging.info("\nQUERY: " + str(sql_stmts[tbl_filter]) + "\nParams:" + str(params[tbl_filter]) + "\nResults: " + str(len(result)))
                    json_results[tbl_filter] = [dict(r) for r in result]
                return dumps(json_results)
            except Exception as e:
                logging.error(traceback.format_exception_only(*sys.exc_info()[0:2])[0])
                return jsonify(error=str(e))
        else:
            return jsonify(error=str("DATABASE has not been initalized yet")), 404
            
@dbBlueprint.route("/info/all", methods=['GET'])
def build_info_tables():
    """
    Gets the tables and the description for what they do.
    """
    hardcoded_table_desc = {
        CRIME_TABLE_NAME:"A database released by the Baltimore Police Department containing reported crimes from Baltimore City.",
        REALESTATE_TABLE_NAME: "A database containing realestae property values based on data given by the State Department of Assessments & Taxation"
    }
    ret = []
    if DATABASE:
        conn = DATABASE.connect()

        for table in inspect(DATABASE).get_table_names():
            # { name, description, filters }
            tbl_info = {"name":table, "description":hardcoded_table_desc[table], "filters":{}}
            for name in inspect(DATABASE).get_columns(table):
                print(name)
                # filter name: { type, info }
                filter_name = name['name'].replace("\"","")
                tbl_info['filters'][filter_name] = {}
                stmt = "SELECT DISTINCT {} FROM {}".format(filter_name, table)
                tbl_info['filters'][filter_name]['values'] = [r[filter_name] for r in conn.execute(stmt).fetchall()]
                tbl_info['filters'][filter_name]['count'] = len(tbl_info['filters'][filter_name]['values'])
                tbl_info['filters'][filter_name]['type'] = get_expected_type(table, filter_name).python_type.__name__
                tbl_info['filters'][filter_name]['nullable'] = None in tbl_info['filters'][filter_name]['values']
                # on a wide range of data, use a max/min 
                if len(tbl_info['filters'][filter_name]['values']) > 256 or get_expected_type(table, filter_name).python_type in [int, float, complex, datetime]:
                    tbl_info['filters'][filter_name]['max'] = max([x for x in tbl_info['filters'][filter_name]['values'] if x is not None])
                    tbl_info['filters'][filter_name]['min'] = min([x for x in tbl_info['filters'][filter_name]['values'] if x is not None])
                    del tbl_info['filters'][filter_name]['values']
            ret.append(tbl_info)
        return jsonify(ret)
    else:
        return jsonify(error=str("DATABASE has not been initalized yet"))
    
@dbBlueprint.route("/info/tables/", methods=['GET'])
def info_table():
    """
    Gets the tables and the description for what they do.
    """
    hardcoded_table_desc = {
        CRIME_TABLE_NAME:"A database released by the Baltimore Police Department containing reported crimes from Baltimore City.",
        REALESTATE_TABLE_NAME: "A database containing realestae property values based on data given by the State Department of Assessments & Taxation"
    }
    ret = []
    if DATABASE:
        for table in inspect(DATABASE).get_table_names():
            ret.append({"name":table, "description":hardcoded_table_desc[table]})
        return jsonify(ret)
    else:
        return jsonify(error=str("DATABASE has not been initalized yet"))

@dbBlueprint.route("/info/tables/<table_name>/", methods=['GET'])
def info_table_cols(table_name):
    """
    Gets the column/headers for a specific table. If `table_name` is unkown, then we redirect to `/info/tables/`.

    Args: 
        table_name: The name of the table to get.
    Returns:
        a jsonified list of headers and datatypes
    """
    if not is_valid_filter_tables(table_name):
        return redirect('/info/tables/')
    else:
        ret = []
        for name in inspect(DATABASE).get_columns(table_name):
            #TODO: explain what each column does?
            ret.append({'name':name['name'].replace("\"",""),'type':name['type'].python_type.__name__})
        return jsonify(ret)

@dbBlueprint.route("/info/tables/<table_name>/<col>", methods=['GET'])
def info_col_uniques(table_name,col):
    """
    Gets a list of unique values (for the columns that have under 100 uniques)
    :returns: A dictionary object with the following key value pairs:
        count - the number of unique values
        type - the python datatype of the column
        nullable - if there are null values in this column
        values - appears when there is less than 256 uniques with a list of the unique values, not included when type is numerical 
        min - appears when when type is numerical or there is greater than 256 uniques. Is the minimum of the column
        max - appears when when type is numerical or there is greater than 256 uniques. Is the maximum of the column
    """
    if not is_valid_filter_tables(table_name):
        return redirect('/info/tables/')
    if not is_valid_db_header(table_name, col):
        return jsonify(error=str("Invalid table key: " + str(col)))
    if DATABASE:
        conn = DATABASE.connect()
        stmt = "SELECT DISTINCT {} FROM {}".format(col, table_name)
        json_results = {}
        result = {}
        result['values'] = [r[col] for r in conn.execute(stmt).fetchall()]
        result['count'] = len(result['values'])
        result['type'] = get_expected_type(table_name, col).python_type.__name__
        result['nullable'] = None in result['values']
        if len(result['values'] ) > 256 or get_expected_type(table_name, col).python_type in [int, float, complex, datetime]:
            result['max'] = max([x for x in result['values'] if x is not None])
            result['min'] = min([x for x in result['values'] if x is not None])
            del result['values']
        return jsonify(result)
    else:
        return jsonify(error=str("DATABASE has not been initalized yet")), 404
    return jsonify(error=str("NOT IMPLEMENTED YET"))

@dbBlueprint.route("/update", methods=['GET'])
def requested_db_update():
    global DATABASE

    # IMPORT DATABASE
    if DATABASE is None:
        DATABASE = create_engine(SQL_DATABASE_URI, convert_unicode=True)
    
    temp = datetime.strptime("1970-01-01 00:00:00.000", "%Y-%m-%d %H:%M:%S.%f")

    # Get the time the database was last updated
    if path.exists(LAST_FULL_DB_UPDATE_FILENAME): 
        f = open(LAST_FULL_DB_UPDATE_FILENAME,'r')
        contents = f.read()
        try:
            temp = datetime.strptime(contents, "%Y-%m-%d %H:%M:%S.%f")
        except:
            temp = datetime.strptime("1970-01-01 00:00:00.000", "%Y-%m-%d %H:%M:%S.%f")

    # if the last update was over a day ago, do the update
    if temp + timedelta(days=1) < datetime.now():
        update_crime_table()
        update_realestate_table()
        with open(LAST_FULL_DB_UPDATE_FILENAME,'w') as f:
            f.write(str(datetime.now()))
    else:
        logging.info("The db's do not need updating right now, as they were last updated on: {}".format(str(temp)))
    
    # Print out the current database formatting
    debugging_output = ""
    for table in inspect(DATABASE).get_table_names():
        debugging_output += "\n****Table Name: " + table + " ****\n"
        for name in inspect(DATABASE).get_columns(table):
            debugging_output += "\n" + name['name'] + " | " + str(name['type'])
        debugging_output += "\nTOTAL ROWS IN TABLE: " + table + ": \t" + str(DATABASE.connect().execute("SELECT COUNT({}) FROM {}".format(inspect(DATABASE).get_columns(table)[0]['name'], table)).fetchall()[0][0])
    logging.warn(debugging_output)
    return jsonify(debugging_output)