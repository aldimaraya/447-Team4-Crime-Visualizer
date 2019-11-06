import numpy as np
import pandas as pd
import logging
from sqlalchemy import create_engine
from sqlalchemy import MetaData
from sqlalchemy import Table
from sqlalchemy import Column
from sqlalchemy import Date
from sqlalchemy import Time
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import String
from flask import Blueprint
from flask import jsonify
from flask import request
from json import dumps

CRIME_DATABASE_URL = "https://data.baltimorecity.gov/resource/wsfq-mvij.json"

# create the file if it does not exist
SQL_DATABASE_FILE_NAME = 'crime.db'
SQL_DATABASE_URI = 'sqlite:///' + SQL_DATABASE_FILE_NAME
DATABASE = None

def initDB():
    # create db file if it does not exist
    open(SQL_DATABASE_FILE_NAME, "w+")
    global DATABASE
    DATABASE = create_engine(SQL_DATABASE_URI, convert_unicode=True)
    
    # an example of how we could potentially initalize a crime database manually
    """
    metadata = MetaData(bind=DATABASE)
    crimeDB = Table(
    'crimeDB', metadata, 
    Column('cUID', String, primary_key = True),
    Column('cDate', Date),
    Column('cTime', Time),
    Column('cCode', String),
    Column('cLoc', String),
    Column('cDesc', String),
    Column('cSide', String),
    Column('cWeap', String),
    Column('cPost', String),
    Column('cDist', String),
    Column('cNebr', String),
    Column('cLong', Float),
    Column('cLatd', Float),
    Column('cPrem', String),
    Column('cVrin', String),
    Column('cTotl', Integer)
    )

    metadata.create_all(DATABASE)
    """

def updateDB():
    """
    Gets and cleans the entire database from the crime website url
    """
    # IMPORT DATABASE
    # importing JSON file created by SODA API into a Pandas dataframe
    try:
        database = pd.read_json(CRIME_DATABASE_URL)
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

    # vri_name1 doesn't seem to have any useful information so we can drop that
    #database = database.drop(['vri_name1'], axis = 1)
    
    database.to_sql('crimeDB2', con=DATABASE, if_exists='replace', index_label='id')
    print(database)
    return True

dbBlueprint = Blueprint('db', __name__)

@dbBlueprint.route("/db/fetchall", methods=['GET','POST'])
def db_all():
    """
    :returns: all data in database, jsonified
    """
    if (DATABASE):
        conn = DATABASE.connect()
        result = conn.execute('SELECT * FROM crimeDB2').fetchall()
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
        result = conn.execute('SELECT * FROM crimeDB2').fetchmany(int(num))
        return dumps([dict(r) for r in result])
    else:
        return jsonify(error=str("DATABASE has not been initalized yet")), 404
