# Dependacies: 
 * Python3.7
 * virtualenv
 
## Installing dependancies: 

  1. Install python3.7 from here: https://www.python.org/downloads/release/python-374/
  
  2. Download and save this file (to anywhere, desktop is fine): https://bootstrap.pypa.io/get-pip.py
  
  3. Open windows powershell and cd to where you installed get-pip.py
  
  4. Run `python .\get-pip.py`
  
  5. Run `pip install virtualenv`
  
## Building the backend

 (from the terminal or windows powershell)
 
  0. cd to `447-Team4/backend/`
  
  1. Run `virtualenv env`
  
  2. On windows: Run `.\env\Scripts\activate`
  
     On linuxtype: Run `env/bin/activate`
     
  3. Install requirements with `pip3 install -r requirements.txt`
  
  4. Deactivate the virtual environment with `deactivate`
  
## Running the backend

  1. Activate the python virtual environment
     
     On windows: Run `.\env\Scripts\activate`
  
     On linuxtype: Run `env/bin/activate`
     
  2. Run the flask server
    `python application.py`
    or `python3 application.py`
    
  3. ctrl+c to quit the server
  
  4. Exit the python virtual environment

     `deactivate`
  
  # TO REQUEST FILTERED DATA FROM THE BACK END:
  ..."/db/filter/" as a **post** request. see the example_req_data.json file to see what the dictionary should look like. 
 
 ### what the sql database should look like:
Tables with the following names: `crime`, `realestate`
Column info for table `crime`: 


| NAME | TYPE | DESCRIPTION | Formatting | Filters |
|-------------------|-------|-------------------------------------------------------------------------------------|--------------------------------------------|-------------------------|
| `id` | INT | The uid of a row in the database *(A row's UID may change after a database update)* | Integer, starting at 1 | `before`, `after`, `is` |
| `crimedate` | STR | The date of the crime. | `"MM/DD/YYYY"` | `before`, `after`, `is` |
| `crimetime` | STR | The time of the crime. | `"HH:MM:ss"` (24 hour format) | `before`, `after`, `is` |
| `crimecode` | STR | The crime code. | A digit followed by one or more characters | `is` |
| `location` | STR | The nearest address to the crime report. |  | `is` |
| `description` | STR | A basic description of the crime. |  | `is` |
| `inside_outside` | STR | If the crime occurred inside or outside. | `I` for inside, and `O` for outside | `is` |
| `weapon` | STR | The type of weapon used. |  | `is` |
| `post` | STR | The post number of the crime. |  | `before`, `after`, `is` |
| `district` | STR | The district in which the crime occurred.  |  | `is` |
| `neighborhood` | STR | The neighborhood in which the crime occurred. |  | `is` |
| `longitude` | FLOAT | The approximate longitude coordinate of the crime.  | A longitude coordinate | `before`, `after`, `is` |
| `latitude` | FLOAT | The approximate latitude coordinate of the crime. | A latitude coordinate | `before`, `after`, `is` |
| `premise` | STR | The premise of the crime. (E.G. Alley, Bar, Cab, Garage, Shed, etc...) |  | `is` |
| `total_incidents` | FLOAT | The total number of incidents for this crime.  |  | `before`, `after`, `is` |
| `vri_name1` | STR | Violence Reduction Initiative zone name.  |  | `is` |



Column info for table `realestate`: 


| NAME | TYPE | DESCRIPTION | Formatting | Filters |
|-------------------|-------|-------------------------------------------------------------------------------------|--------------------------------------------|-------------------------|
| `uid` | BIGINT | The unique id of this realestate item  |  | `before`, `after`, `is` |
| `perm_home` | TEXT | If this is a permanent resedency.  | `N`,`H`,`D`, or `null` | `is` |
| `date_sold` | TEXT | The date the property was last sold. |  | `before`, `after`, `is` |
| `year_built` | BIGINT | The year the property was built.  |  | `before`, `after`, `is` |
| `owner_mode` | TEXT | The Ownership Mode (idk)  | `F`,`L`,`null`,`3` | `is` |
| `vacant` | TEXT | If the property is listed as vacant.  | `Y`,`N`,`null`| `is` |
| `addr_prefix` | TEXT | The address prefix. |  | `is` |
| `addr_name` | TEXT | The address street. |  | `is` |
| `addr_suffix` | TEXT | The address street type. |  | `is` |
| `addr_num` | INTEGER | The building number. |  | `is` |
| `ESTPRICE` | FLOAT | The estimated price of the property. |  |  `before`, `after`, `is` |
| `longitude` | FLOAT | The estimated central longitude of the property. |  `before`, `after`, `is` |
| `latitude` | FLOAT | The estimated central latitude of the property. |  | `before`, `after`, `is` |


| Filter | Action | Expecting |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| before | Returns all records where the record is less than or equal to the input | Single value -> `"valueXYZ"` |
| after | Returns all records where the record is greater than or equal to the input | Single value -> `"valueXYZ"` |
| is | Returns all records that match any value in the input list | List -> `["value1", "value2", ..., "valueN"]` |
| radius | **not implemented yet** Returns all records in a specific radius to a coordinate point | Object -> `{ "longitude":x, "latitude":y, "radius":z }` |


***Notes:*** 
  - Using both the `before` and `after` filter on a specific column value returns all records between the two inputs (inclusive). 
  - Using the `before`, `after`, and `is` filters simultaneously will ignore the values in the `is`.  
  - Using a filter on a specific column where it is not listed may result in strange returned values. 
  - You may request a value of `null` as a value in the `is` list.

we are not doing this multithreaded because we plan to deploy on a simple tiny server