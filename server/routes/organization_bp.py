from flask import Blueprint, request
from flask_cors import cross_origin, CORS
from global_utils import ResponseData, config
from .utils.data_validator import PropertyValidator
from jwt_utils import verify_user
import mysql.connector

organization_bp = Blueprint("organization", __name__, url_prefix='/api/organization')
CORS(organization_bp, resources={r"/api/*": {"origins": "*"}})

organization_attributes = ['name', 'address', 'city', 'country']

# TODO
# Get Organizations by User ID
# Get Organization by ID

# region Create Organization

@organization_bp.route('', methods=['POST'])
@organization_bp.route('/', methods=['POST'])
@cross_origin()
def insert_data_route():
    try:
        verified_id = verify_user(request.headers, request.args)
        
        data: dict = request.get_json()
        
        org_data = data.get('organization')
        validated_org_data, org_data_is_valid = PropertyValidator(org_data, organization_attributes).get_validated_values()
        
        # TODO Finish provisioning later
        email_data = data.get('emails')
        
        if all([validated_org_data, org_data_is_valid, verified_id]):
            returned_id = insert_org_data(validated_org_data, verified_id)
            if not returned_id:
                raise Exception("Failed to create and insert organization data")
            org_data['org_id'] = returned_id
            return ResponseData(
                "/api/organization",
                "Organization Created: Data inserted successfully",
                org_data,
                201
            ).get_response_data()
        else:
            return ResponseData(
                "/api/organization",
                "Organization Not Created: Missing required data",
                None,
                400
            ).get_response_data()
    except Exception as e:
        return ResponseData(
            "/api/organization",
            f"Organization Not Created: {e}",
            None,
            500
        ).get_response_data()

def insert_org_data(org_data: dict, user_id: str):
    connection, cursor = None, None
    try:
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor()
        
        query = """
            INSERT INTO organizations (
                name,
                address,
                city,
                country,
                owner
            ) VALUES (%s, %s, %s, %s, (SELECT ID FROM USERS WHERE AUTH_ID = %s));
        """
        values = (
            org_data.get('name'), 
            org_data.get('address'),
            org_data.get('city'),
            org_data.get('country'),
            user_id, 
        )
        
        cursor.execute(query, values)
        org_id = cursor.lastrowid
        
        connection.commit()
        return org_id
    except Exception:
        return None
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# endregion