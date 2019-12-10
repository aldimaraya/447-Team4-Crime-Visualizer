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
  
     On linuxtype: Run `source env/bin/activate`
     
  3. Install requirements with `pip3 install -r requirements.txt`
  
  4. Deactivate the virtual environment with `deactivate`
  
## Running the backend

  1. Activate the python virtual environment
     
     On windows: Run `.\env\Scripts\activate`
  
     On linuxtype: Run `source env/bin/activate`
     
  2. Run the flask server
    `python application.py`
    or `python3 application.py`
    
  3. ctrl+c to quit the server
  
  4. Exit the python virtual environment

     `deactivate`
  
  # TO REQUEST THE AVAILABLE TYPES OF FILTERS:
  Using an HTTP GET request, visit the path `/info/all` which will return the table names and the filter types and values with the requestable data as json. See the following block for an example.
  ```
  [
  {
    "description": "A database released by the Baltimore Police Department containing reported crimes from Baltimore City.",
    "name": "crime",
    "filters": {
      "crimecode": {
        "count": 81,
        "nullable": false,
        "type": "str",
        "values": [
          "6G",
          "5A",
          "3JF",
          "3AF",
          ... additional values
        ]
      },
      "crimedate": {
        "count": 2229,
        "max": "2019-11-30 00:00:00.000000",
        "min": "1963-10-30 00:00:00.000000",
        "nullable": false,
        "type": "datetime"
      },
      "crimetime": {
        "count": 1479,
        "max": "23:59:00",
        "min": "00:00:00",
        "nullable": true,
        "type": "str"
      },
      ... additional filters
  },
  ... additional table info
]
  ```  

  # TO REQUEST FILTERED DATA FROM THE BACK END:
  ..."/db/filter/" as a **post** request. see the example_req_data.json file to see what the dictionary should look like. 
 
 ### what the sql database should look like:
Tables with the following names: `crime`, `realestate`
Column info for table `crime`: 


| NAME | TYPE | DESCRIPTION | Formatting | Filters |
|-------------------|-------|-------------------------------------------------------------------------------------|--------------------------------------------|-------------------------|
| `id` | INT | The uid of a row in the database *(A row's UID may change after a database update)* | Integer, starting at 1 | `before`, `after`, `is` |
| `crimedate` | DATETIME | The date of the crime. | `"MM/DD/YYY"` or any valid string containing a date stamp. | `before`, `after`, `is` |
| `crimetime` | DATETIME | The time of the crime. | `"HH:MM:SS"` (24 hour format) | `before`, `after`, `is` |
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
| `date_sold` | DATETIME | The date the property was last sold. | `MMDDYYYY` or any valid string containing a date stamp. | `before`, `after`, `is` |
| `year_built` | BIGINT | The year the property was built.  | `YYYY`, or `null` | `before`, `after`, `is` |
| `owner_mode` | TEXT | The Ownership Mode (idk)  | `F`,`L`,`null`,`3` | `is` |
| `vacant` | TEXT | If the property is listed as vacant.  | `Y`,`N`,`null`| `is` |
| `addr_prefix` | TEXT | The address prefix. |  | `is` |
| `addr_name` | TEXT | The address street. |  | `is` |
| `addr_suffix` | TEXT | The address street type. |  | `is` |
| `addr_num` | INTEGER | The building number. |  | `is` |
| `est_value` | FLOAT | The estimated price of the property. |  |  `before`, `after`, `is` |



| Filter | Action | Expecting |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| before | Returns all records where the record is less than or equal to the input | Single value -> `"valueXYZ"` |
| after | Returns all records where the record is greater than or equal to the input | Single value -> `"valueXYZ"` |
| is | Returns all records that match any value in the input list | List -> `["value1", "value2", ..., "valueN"]` |



***Notes:*** 
  - Using both the `before` and `after` filter on a specific column value returns all records between the two inputs (inclusive). 
  - Using the `before`, `after`, and `is` filters simultaneously will ignore the values in the `is`.  
  - Using a filter on a specific column where it is not listed may result in strange returned values. 
  - You may request a value of `null` as a value in the `is` list.

we are not doing this multithreaded because we plan to deploy on a simple tiny server

### example filter data and usage
To request up to 20 of the realestate values greater than $100,000; and all crimes with the following criteria: 
 * that happened on or after January 31st, 2012 
 * that happened between 14:00 hrs and 18:00 hrs
 * that is tagged with the premise "ALLEY", or "BAR"

```
myFilters = {
  crime: {
    crimedate: { after: "01/31/2012" },
    crimetime: { after: "14:00:00", before: "18:00:00" },
    premise: { is: ["ALLEY", "BAR"] }
  },
  realestate: {
    limit: 20,
    est_value: { after: 100000 }
  }
}
```

To get the data with something such as Axios:
```
axios.post(API_ENDPOINT + '/db/filter/', myFilters)
  .then((response) => {
      if (response.data.get('error', null)){
        console.log("Error: " + response.data['error'])
      } else { 
        console.log("Data successfully retrieved");
        console.log("Data:", response.data);
      }
  })
  .catch(function (error) {
      console.log("Error: ", error);
  })
```
