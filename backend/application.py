import logging
from flask import url_for
from flask import Flask
import re
from defaults import defaultBlueprint
from databaseHandler import dbBlueprint
from databaseHandler import updateDB


# start the database
#initDB()
updateDB()

# Init flask application
application = Flask(__name__)
# Register blueprints
application.register_blueprint(defaultBlueprint)
application.register_blueprint(dbBlueprint)


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
        #re.sub(r'([<](.*?)[>])+','\<\\2\>',str(rule))
        link = re.sub(r'[<>]','',str(rule))
        if "static/" not in link:
            links.append(link)

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
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    return response


# run the app.
if __name__ == "__main__":

    logging.basicConfig(
        filename = 'flaskLogs.log',  # log to file # TODO: UNCOMMENT LINE FOR PRODUCTION
        filemode = 'a+',
        level = logging.WARN,
        format = '%(asctime)s.%(msecs)03d,%(levelname)s,%(module)s,%(funcName)s,%(message)s',
        datefmt = '%Y-%m-%d %H:%M:%S',
    )
    logger = logging.getLogger('werkzeug')
    handler = logging.FileHandler('flaskLogs.log')
    logger.addHandler(handler)
    logging.info('Started app')
    # Setting debug to True enables debug output. TODO: This line should be
    # removed before deploying a production app.
    application.debug = False
    application.run()
    logging.info("closing app")
    