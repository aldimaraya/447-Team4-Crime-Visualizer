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

CRIME_DATABASE_URL = "https://data.baltimorecity.gov/resource/wsfq-mvij.json"
DB_TABLE_NAME = 'crimeDB2'
SQL_DATABASE_FILE_NAME = 'crime.db'
SQL_DATABASE_URI = 'sqlite:///' + SQL_DATABASE_FILE_NAME
DATABASE = None



def initDB():
    """ 
    initalizes the database if it does not exist with a backup file
    TODO: For production we should probably remove this part 
    """
    global DATABASE
    DATABASE = create_engine(SQL_DATABASE_URI, convert_unicode=True)
    
    try:
        # Check to see if the inital table already exists, if so abort here
        pd.read_sql_table(DB_TABLE_NAME, DATABASE)
    except ValueError as e:
        # table does not exist yet, so fill it
        
        with open('BPD_Part_1_Victim_Based_Crime_Data.csv', 'r') as file:
            database = pd.read_csv(file, dtype={"crimedate":str,"crimetime":str,"crimecode":str,"location":str,"description":str,"inside_outside":str,"weapon":str,"post":float,"district":str,"neighborhood":str,"longitude":float,"latitude":float,"location 1":str,"premise":str,"vri_name1":str,"total_incidents":float})
        database['weapon'] = database['weapon'].replace("NA", np.nan)

        # fixing some formatting inconsistencies
        database['inside_outside'] = database['inside_outside'].replace("(?i)outside", "O",regex=True)
        database['inside_outside'] = database['inside_outside'].replace("(?i)inside", "I",regex=True)
        
        database['crimedate'] = database['crimedate'].replace("T00:00:00.000","",regex=True)
        # vri_name1 doesn't seem to have any useful information so we can drop that
        #database = database.drop(['vri_name1'], axis = 1)
        
        #clear out any special funny chars so we can clean the requested data
        database = database.replace("[#\"\'_]", "",regex=True)

        # TODO not an error
        logging.error("Attempting to load " + str(len(database['crimedate'])) + " rows")

        database.to_sql(DB_TABLE_NAME, con=DATABASE, index=True, index_label='id', if_exists='replace')
        # TODO not an error
        logging.error("Loaded " + str(len(database['crimedate'])) + " rows" + str(database))

    

def updateDB():
    """
    Gets and cleans the entire database from the crime website url
    """
    # IMPORT DATABASE
    # importing JSON file created by SODA API into a Pandas dataframe
    try:
            
        # authenticated client with api token
        client = Socrata("data.baltimorecity.gov", 'QIp1Jkf0zTvXH0jc2j8xMoRim')

        # First 2000 results, returned as JSON from API / converted to Python list of
        # dictionaries by sodapy.
        results = client.get("wsfq-mvij", limit=10000000)

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

    database.to_sql(DB_TABLE_NAME, con=DATABASE, index=True, index_label='id', if_exists='replace')
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
       
        # filter before & after date & time
        # filter by select crime codes
        # filter by locations?
        # filter by select descriptions?
        # filter by in or out
        # filter by select weapon
        # filter by post?
        # filter by district?
        # filter by neighborhood?
        # filter by lat/long?
        # filter by premise? 
        logging.info(filters)
        for cols in filters:
            if not is_valid_db_header(cols):
                return None, "Invalid key: " + str(cols)
            if not is_clean_filter_request(filters[cols]):
                return None, "Invalid key value: " + str(cols) + " -> " + str(filters[cols])
            before = filters[cols].get("before", None)
            after = filters[cols].get("after", None)
            ls = filters[cols].get("is", None)
            logging.info(cols)
            #if before and after and ls:
                #return jsonify(error=str("Had filter with between & is: " + str(cols)))
            #el
            if before and after:
                stmt += str(cols) + " BETWEEN " 
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
        result = conn.execute(stmt).fetchall()
        return dumps([dict(r) for r in result])
        result = conn.execute('SELECT * FROM ' + DB_TABLE_NAME).fetchmany(int(num))
        return dumps([dict(r) for r in result])
    else:
        return jsonify(error=str("DATABASE has not been initalized yet")), 404

