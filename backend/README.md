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
  
  
 
