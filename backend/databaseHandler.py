import logging
import re
import numpy as np
import pandas as pd
from sodapy import Socrata
from sqlalchemy import create_engine
from sqlalchemy import MetaData
from sqlalchemy import Table
from sqlalchemy import Column
from sqlalchemy import Date
from sqlalchemy import Time
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import String, inspect
from flask import Blueprint
from flask import jsonify
from flask import request
from json import dumps
from json import load
from requests import post as post_request
import traceback, sys
from datetime import datetime, timedelta
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
    try: 
        f = open('lastupdated','r')
        contents = f.read()
        temp = datetime.strptime(contents, "%Y-%m-%d %H:%M:%S.%f")
    except Exception as e:
        logging.error(e)    
    if temp + timedelta(days=1) < datetime.now():
        update_crime_table()
        update_realestate_table()
        with open('lastupdated','w') as f:
            f.write(str(datetime.now()))
    else:
        print("Not updating the databases right now")
    debugging_output = ""
    for table in inspect(DATABASE).get_table_names():
        debugging_output += "\n************\n" + table + "\n************"
        for name in inspect(DATABASE).get_columns(table):
            debugging_output +=  "\n| `{}` | {} | desc  |  | `b4afis` |".format(name['name'],name['type'])
            #debugging_output += "\n\t" + name['name'] + " | " 
    debugging_output += "\nROWS in " + CRIME_TABLE_NAME + " db: \t" + str(DATABASE.connect().execute("SELECT COUNT(id) FROM " + CRIME_TABLE_NAME).fetchall()[0][0])
    debugging_output += "\nROWS in " + REALESTATE_TABLE_NAME + " db: \t" + str(DATABASE.connect().execute("SELECT COUNT(uid) FROM " + REALESTATE_TABLE_NAME).fetchall()[0][0])
    logging.warn(debugging_output)


def update_crime_table():
    """
    Updates the crime reports table
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
        # First 10000000 results, returned as JSON from API / converted to Python
        # list of dictionaries by sodapy.
        results = client.get(CRIME_DATABASE_UID, limit=10000000)
        client.close()
    except Exception as e:
        logging.error('Fatal error when attempting to retreive crime database')
        logging.error(e)
        
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
    
    database['crimedate'] = database['crimedate'].replace("T00:00:00.000","",regex=True)
    # vri_name1 doesn't seem to have any useful information so we can drop that
    #database = database.drop(['vri_name1'], axis = 1)
    
    #clear out any special funny chars so we can clean the requested data
    database = database.replace("[#\"\'_]", "",regex=True)
    database = database.astype({"longitude":float,"latitude":float,"total_incidents":float})
    database.to_sql(CRIME_TABLE_NAME, con=DATABASE, index=True, index_label='id', if_exists='replace')
    logging.info([" ".join([str(x['name']),str(x['type'])]) for x in inspect(DATABASE).get_columns(CRIME_TABLE_NAME)])

def update_realestate_table():
    """
    Updates the realestate market values table
    """
    # TODO if we hit an out of memory error around here, we should fix how we read in the data

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
            'f':'json',                                 # json format
            'units':'esriSRUnit_StatuteMile',           # 1 mile unit
            'resultRecordCount':max_req,                # the number of records to request at this time
            'orderByFields':'OBJECTID'                  # the field to be sorted by
            }
        # make the request. Because we do a post request, this should return the entire database in one go
        db_request = None
        try:
            db_request = post_request(url = RE_DATABASE_URL, data = data)
        except Exception as e:
            logging.error('Fatal error when attempting to retreive realestate database')
            logging.error(e)
            return

        # double check the return values
        if 'json' in db_request.headers.get('Content-Type'):
            results = db_request.json()
        else:
            logging.error('Realestate database request content is not in JSON format.')
            return

        # ensure we received data and have not received all of the data yet
        if len(results['features']) == 0 or not results.get('exceededTransferLimit', True):
            break
        else:
            # move the geometry into the the pandas dataframe as its own columns
            coords_table = [x['geometry']['rings'] for x in results['features']]
            avgs = []
            for group in coords_table:
                groupavg = [0,0]
                for pair in group:
                    for row in pair:
                        groupavg[0] += row[0]
                        groupavg[1] += row[1]
                avgs.append([groupavg[0]/len(pair), groupavg[1]/len(pair)])
            coords_db = pd.DataFrame.from_records(avgs,columns=["longitude","latitude"])
            
            # convert the whole database into its own dataframe
            temp_table = [x['attributes'] for x in results['features']]

            last_id = temp_table[-1]['OBJECTID']
            logging.warn("RECEIVED REALESTATE ID's: " + str(temp_table[0]['OBJECTID']) + " -> " + str(temp_table[-1]['OBJECTID']))
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

            # Add coords to rows
            temp_database['longitude'] = coords_db['longitude']
            temp_database['latitude'] = coords_db['latitude']
            
            # rename column headers
            temp_database = temp_database.rename(columns={'PERMHOME': 'perm_home' , 'SALEDATE': 'date_sold' , 'YEAR_BUILD': 'year_built', 'OWNMDE': 'owner_mode' , 'VACIND':'vacant' , 'STDIRPRE': 'addr_prefix' , 'ST_NAME': 'addr_name' , 'ST_TYPE': 'addr_suffix' , 'BLDG_NO': 'addr_num'}, errors='raise')
            
    
            # add to sql database
            temp_database = temp_database.astype({"addr_num":int})
            temp_database.to_sql(REALESTATE_TABLE_NAME, con=DATABASE, index=True, index_label='uid', if_exists=if_exists)

            # setup vars for next loop. 
            # make all following writes append and not replace
            if_exists = 'append'
            # setup the next query statement
            where_stmt = "OBJECTID > {} AND OBJECTID < {}".format(last_id, last_id+max_req)

        logging.info([" ".join([str(x['name']),str(x['type'])]) for x in inspect(DATABASE).get_columns(REALESTATE_TABLE_NAME)])
    else:
        logging.error('Missing realestate data')
    

def is_valid_filter_tables(names):
    """
    :returns: True if the table names given exist inside the database, and the database exists. Otherwise, False
    """
    if DATABASE:
        for name in names:
            if name not in DATABASE.table_names():
                return False
    else: 
        return False
    return True

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
    valid_filter_keys = ["before","after","is","near","radius"]
    for key in filters:
        if str(key) not in valid_filter_keys:
            return False
        elif type(filters[key]) is list:
            for option in filters[key]:
                if type(option) is str and ";" in option:
                    return False
        elif type(filters[key]) is str and ";" in filters[key]:
            return False
    return True


def convert_reqest_to_sql(filters):
    """
    :arg: filters A dictionary with the expected filters
    :returns: a string with the sql statement corresponding to the filters requested, or None and an error string if invalid
    """
    statements = {}
    try:
        if not is_valid_filter_tables(filters.keys()):
            return statements, "Invalid table requested: " + str(filters.keys())

        for table_name in filters.keys():
            stmt = "SELECT * FROM " + table_name + " WHERE "
            where = ""

            for cols in filters[table_name]:
                # validate this filter
                if not is_valid_db_header(table_name, cols):
                    return statements, "Invalid table key: " + str(cols)
                if not is_clean_filter_request(filters[table_name][cols]):
                    return statements, "Invalid key value: " + str(cols) + " -> " + str(filters[table_name][cols])
                
                # get the values
                before = filters[table_name][cols].get("before", None)
                after = filters[table_name][cols].get("after", None)
                ls = filters[table_name][cols].get("is", None)
                """
                if before and type(before) is not float and type(before) is not str:
                    return statements, "Invalid filter data format: \'before\' requires single value"
                elif after and type(after) is not float and type(after) is not str:
                    return statements, "Invalid filter data format: \'after\' requires single value"
                elif ls and type(ls) is not list:
                    return statements, "Invalid filter data format: \'is\' requires a list of single values"
                """
                if 'before' in filters[table_name][cols].keys() and 'after' in filters[table_name][cols].keys():
                    where += str(cols) + " BETWEEN " 
                    if type(before) is str or type(after) is str:
                        where += "\"" + str(after) + "\" AND \"" + str(before) + "\"" 
                    else:
                        where += str(after) + " AND " + str(before)

                elif 'before' in filters[table_name][cols].keys():
                    where += str(cols) + " <= " 
                    if type(before) is str:
                        where += "\"" + str(before) + "\""
                    else:
                        where += str(before)

                elif 'after' in filters[table_name][cols].keys():
                    where += str(cols) + " >= " 
                    if type(after) is str:
                        where += "\"" + str(after) + "\""
                    else:
                        where += str(after)

                elif 'is' in filters[table_name][cols].keys():
                    ls = list(dict.fromkeys(ls))
                    i = 0
                    while i < len(ls):
                        where += str(cols)
                        if type(ls[i]) is str:
                            where += " LIKE \"" + str(ls[i]) + "\" "
                        elif ls[i] is None:
                            where += " IS NULL "
                        else:
                            where += " = " + str(ls[i])
                        i += 1
                        if i < len(ls):
                            where += " OR "

                if len(where) > 0:
                    # `and`, to intersect with the next filter
                    where += " AND "
                else:
                    print("???" + cols)
            statements[table_name] = stmt + where[:-5]
        return statements, None

    except Exception as e:
        # TODO: REMOVE THE TRACEBACK PRINTING FOR DEPLOYMENT
        exc_type, exc_value, exc_traceback = sys.exc_info()
        traceback.print_exception(exc_type, exc_value, exc_traceback, limit=2, file=sys.stdout)
        logging.error(e)
        return None, "Something went wrong while attempting to convert the request into an sql statement"

# The blueprint
dbBlueprint = Blueprint('db', __name__)

@dbBlueprint.route("/db/filter/", methods=['POST'])
def db_filterdata():
    """
    :returns: the filtered data corresponding to the requested filter
    """
    # get post request data as json
    filter_request = request.get_json()

    # data validation
    if type(filter_request) is not dict:
        return jsonify(error=str("Invalid request, requires a dictionary set"))
    
    if len(filter_request.keys()) == 0:
        return jsonify(error=str("No filters requested"))

    sql_stmts, err = convert_reqest_to_sql(filter_request)

    if err is not None:
        logging.error(err)
        return jsonify(error=str(err))

    if DATABASE:
        conn = DATABASE.connect()
        try: 
            json_results = {}
            for tbl_filter in sql_stmts.keys():
                result = conn.execute(sql_stmts[tbl_filter]).fetchall()
                print("run: " + sql_stmts[tbl_filter] + " results: ", len(result))
                json_results[tbl_filter] = [dict(r) for r in result]
            return dumps(json_results)
        except Exception as e:
            logging.error(e)
            return jsonify(error=str(e))
    else:
        return jsonify(error=str("DATABASE has not been initalized yet")), 404

