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
  
  4. Run the flask server with
  
    `python3 application.py`
  
  
 
