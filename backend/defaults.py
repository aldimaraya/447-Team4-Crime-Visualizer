from flask import jsonify
from flask import request
from flask import url_for
from builtins import application as app


@app.route("/", methods=['GET'])
def get_home():
    """
    The default home page. Display a site map
    """
    map_html = "Site Map: <br/>"
    links = []
    for rule in app.url_map.iter_rules():
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


def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)


@app.errorhandler(404)
def uri_not_found(e):
    """
    :returns: A jsonified error message for a 404 not found error. 
    """
    return jsonify(error=str(e)), 404


@app.errorhandler(400)
def resource_not_found(e):
    """
    Error handler for error code 400. Our API's should abort with an error 400 
    if the resource requested was from a valid URI but the key data could not 
    be found.
    Ex:
        /v2/labels/aida_log >> returns "Log Message"
        /v2/labels/aida_invalid_unknown >> aborts to error 400 message
    :returns: A jsonified error message for a 404 not found error. 
    """
    return jsonify(error=str(e) + " Check the spelling of the resource requested."), 400


@app.after_request
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
