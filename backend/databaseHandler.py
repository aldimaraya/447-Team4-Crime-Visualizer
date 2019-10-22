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
from json import dumps, load

# Constants
# related to the URI of the online database
CRIME_DATABASE_URL = "data.baltimorecity.gov"
CRIME_DATABASE_UID = "wsfq-mvij"
CRIME_DATABASE_DATA_FORMAT = ".json"

SOCRATA_API_KEY = 'QIp1Jkf0zTvXH0jc2j8xMoRim'

# related to the local SQL database
DB_TABLE_NAME = 'crimeDB'
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

    try:
        
        # authenticated client with api token
        client = Socrata(CRIME_DATABASE_URL, SOCRATA_API_KEY)

        # First 10000000 results, returned as JSON from API / converted to Python
        # list of dictionaries by sodapy.
        results = client.get(CRIME_DATABASE_UID, limit=10000000)

        # Convert to pandas DataFrame
        database = pd.DataFrame.from_records(results)
    except:
        logging.error("Unable to read json from url: " + str(CRIME_DATABASE_URL))
        return False

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
    database = database.astype({"post":float,"longitude":float,"latitude":float,"total_incidents":float})#,"crimetime":str,"crimecode":str,"location":str,"description":str,"inside_outside":str,"weapon":str,"post":float,"district":str,"neighborhood":str,"longitude":float,"latitude":float,"location_1":str,"premise":str,"total_incidents":float,"vri_name1":str})
    database.to_sql(DB_TABLE_NAME, con=DATABASE, index=True, index_label='id', if_exists='replace')
    print([" ".join([str(x['name']),str(x['type'])]) for x in inspect(DATABASE).get_columns(DB_TABLE_NAME)])
    return True

dbBlueprint = Blueprint('db', __name__)

@dbBlueprint.route("/db/fetchall", methods=['GET','POST'])
def db_all():
    """
    :returns: all data in database, jsonified
    """
    if (DATABASE):
        conn = DATABASE.connect()
        result = conn.execute('SELECT * FROM ' + DB_TABLE_NAME).fetchall()
        return dumps([dict(r) for r in result])
    else:
        return jsonify(error=str("DATABASE has not been initalized yet")), 404

@dbBlueprint.route("/db/fetch/<int:num>", methods=['GET','POST'])
def db_proto(num):
    """
    :returns: all data in database, jsonified
    """

    # TODO: CHECK/ENABLE FOR POST?
    if (DATABASE):
        conn = DATABASE.connect()
        result = conn.execute('SELECT * FROM ' + DB_TABLE_NAME).fetchmany(int(num))
        return dumps([dict(r) for r in result])
    else:
        return jsonify(error=str("DATABASE has not been initalized yet")), 404


def is_valid_db_header(key):
    """
    :returns: True if the key is a valid database column header name, otherwise False
    """
    return key in [col["name"] for col in inspect(DATABASE).get_columns(DB_TABLE_NAME)]

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
    try:
        stmt = "SELECT * FROM " + DB_TABLE_NAME + " WHERE "
       
        
        for cols in filters:
            # validate this filter
            if not is_valid_db_header(cols):
                return None, "Invalid key: " + str(cols)
            if not is_clean_filter_request(filters[cols]):
                return None, "Invalid key value: " + str(cols) + " -> " + str(filters[cols])
            
            # get the values
            before = filters[cols].get("before", None)
            after = filters[cols].get("after", None)
            ls = filters[cols].get("is", None)

            #if before and after and ls:
                #return jsonify(error=str("Had filter with between & is: " + str(cols)))
            #el
            if before and after:
                stmt += str(cols) + " BETWEEN " 
                #temp = "{0}" + str(before) + "{0} AND {0}" + str(after) + "{0}"
                #stmt += temp.format("\"" if type(before) is str or type(after) is str else "")
                if type(before) is str or type(after) is str:
                    stmt += "\"" + str(before) + "\" AND \"" + str(after) + "\"" 
                else:
                    stmt += str(before) + " AND " + str(after)

            elif before:
                stmt += str(cols) + " <= " 
                if type(before) is str:
                    stmt += "\"" + str(before) + "\""
                else:
                    stmt += str(before)

            elif after:
                stmt += str(cols) + " >= " 
                if type(after) is str:
                    stmt += "\"" + str(after) + "\""
                else:
                    stmt += str(after)

            elif ls:
                ls = list(dict.fromkeys(ls))
                i = 0
                while i < len(ls):
                    stmt += str(cols)
                    if type(ls[i]) is str:
                        stmt += " LIKE \"" + str(ls[i]) + "\" "
                    elif ls[i] is None:
                        stmt += " IS NULL "
                    else:
                        stmt += " = " + str(ls[i])
                    i += 1
                    if i < len(ls):
                        stmt += " OR "

            # `and`, to intersect with the next filter
            stmt += " AND "
        stmt += " TRUE "
        return stmt

    except Exception as e:
        logging.error(e)
        return None, "Something went wrong while attempting to convert the request into an sql statement"


@dbBlueprint.route("/db/run/", methods=['GET'])
def db_runstmt():
    """
    this function is for debugging purposes. it will be replaced with the `/db/filter/` function during production 
    """
    # TODO: CHECK/ENABLE FOR POST?
    if (DATABASE):
        conn = DATABASE.connect()
         # debugging, we use a predefined json file
        with open('example_req_data2.json') as json_file:
            filters = load(json_file)
        stmt = convert_reqest_to_sql(stmt)
        result = conn.execute(stmt).fetchall()
        return dumps([dict(r) for r in result])
    else:
        return jsonify(error=str("DATABASE has not been initalized yet")), 404


@dbBlueprint.route("/db/filter/", methods=['POST'])
def db_filterdata():
    """
    :returns: the filtered data corresponding to the requested filter
    """
    filter_request = request.get_json()
    if type(filter) is list:
        return jsonify(error=str("Invalid request, requires a dictionary set"))
    filters = filter_request.keys()
    if len(filters) == 0:
        return jsonify(error=str("No filters requested"))

    sql_stmt, err = convert_reqest_to_sql(filter_request)
    if sql_stmt is None:
        return jsonify(error=str())
    if DATABASE:
        conn = DATABASE.connect()
        try: 
            result = conn.execute(stmt).fetchall()
            return dumps([dict(r) for r in result])
        except Exception as e:
            return jsonify(error=str(e))
    else:
        return jsonify(error=str("DATABASE has not been initalized yet")), 404

