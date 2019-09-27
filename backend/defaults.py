from flask import jsonify
from flask import request
from flask import Blueprint

defaultBlueprint = Blueprint('defaults', __name__)
@defaultBlueprint.app_errorhandler(404)
def uri_not_found(e):
    """
    :returns: A jsonified error message for a 404 not found error. 
    """
    return jsonify(error=str(e)), 404


@defaultBlueprint.app_errorhandler(400)
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



