import logging
from flask import url_for
from flask import Flask

from defaults import defaultBlueprint
from databaseHandler import initDB
from databaseHandler import dbBlueprint
from databaseHandler import updateDB


# start the database
initDB()
updateDB()

# Init flask application
application = Flask(__name__)
# Register blueprints
application.register_blueprint(defaultBlueprint)
application.register_blueprint(dbBlueprint)


def has_no_empty_params(rule):
    """
    Helper function for `get_home()`. dont feel like explaining lol 
    """
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)
    
@application.route("/", methods=['GET'])
def get_home():
    """
    The default home page. Display a site map
    """
    map_html = "Site Map: <br/>"
    links = []
    for rule in application.url_map.iter_rules():
        # Filter out rules we can't navigate to in a browser
        # and rules that require parameters
        if (("GET" in rule.methods) or ("POST" in rule.methods)) and has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            links.append(url)
    # links is now a list of url, endpoint tuples
    for item in sorted(links):
        map_html += "<a href=\"" + item + \
            "\" rel = \"nofollow noreferrer\" >" + item + "</a><br/>"
    return map_html

@application.after_request
def after_request(response):
    """
    Copied code from StackOverflow to solve the 'POST' 'OPTION' issue.
    Adding these headers fixes CORS errors. 
    """
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response


# run the app.
if __name__ == "__main__":
    logging.basicConfig(
        # file = 'backendLogs.log'  # log to file # TODO: UNCOMMENT LINE FOR PRODUCTION
        level=logging.INFO,
        format='%(asctime)s.%(msecs)03d,%(levelname)s,%(module)s,%(funcName)s,%(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
    )
    logging.info('Started app')
    # Setting debug to True enables debug output. This line should be
    # removed before deploying a production app.
    application.debug = True
    application.run()
    logging.info("closing app")