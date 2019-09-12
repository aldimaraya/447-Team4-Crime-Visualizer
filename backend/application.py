import builtins
from flask import Flask

# create the flask app in the builtins scope so that all api versions have
# access to it
builtins.application = Flask(__name__)

# To prevent pep8 from changing the imports add this to the settings config:
#   "python.formatting.autopep8Args": ["--ignore", "E402"]

# IMPORT APIs
from defaults import *

application = builtins.application

# run the app.
if __name__ == "__main__":
    # Setting debug to True enables debug output. This line should be
    # removed before deploying a production app.
    application = builtins.application
    application.debug = True
    application.run()