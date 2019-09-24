import numpy as np
import pandas as pd
from sqlalchemy import create_engine

CRIME_DATABASE_URL = "https://data.baltimorecity.gov/resource/wsfq-mvij.json"

def buildDatabase(jsonUrl):
    # IMPORT DATABASE
    # importing JSON file created by SODA API into a Pandas dataframe
    database = pd.read_json(CRIME_DATABASE_URL)

    # CLEAN DATA
    # manually converting all instances of "NA" in the "Weapon" column to NaN
    # so that program can properly handle it for any calculations
    database['weapon'] = database['weapon'].replace("NA", np.nan)

    # fixing some formatting inconsistencies
    database['inside_outside'] = database['inside_outside'].replace("(?i)outside", "O",regex=True)
    database['inside_outside'] = database['inside_outside'].replace("(?i)inside", "I",regex=True)

    # vri_name1 doesn't seem to have any useful information so we can drop that
    #database = database.drop(['vri_name1'], axis = 1)
    engine = create_engine('sqlite://', echo=False)
    database.to_sql('crimes', con=engine, if_exists='replace',index_label='id')
    return engine
    

