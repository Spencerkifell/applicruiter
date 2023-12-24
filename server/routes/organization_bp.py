from flask import Blueprint, request
from flask_cors import cross_origin, CORS
from global_utils import ResponseData, PropertyValidator, RouteException, config
from jwt_utils import verify_user
import mysql.connector

organization_bp = Blueprint("organization", __name__, url_prefix='/api/organization')
CORS(organization_bp, resources={r"/api/*": {"origins": "*"}})

organization_attributes = ['name', 'address', 'city', 'country']

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
        
        # TODO Finish provisioning aspect at a later date
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
        status_code = getattr(e, 'status_code', 500)
        return ResponseData(
            "/api/organization",
            f"Organization Not Created: {e}",
            None,
            status_code
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

# region Get Organization

# Get Organization by ID

@organization_bp.route('/<org_id>', methods=['GET'])
@cross_origin()
def get_organization(org_id):
    try:
        verified_id = verify_user(request.headers, request.args)
        organization = get_org_data(org_id, verified_id)
        return ResponseData(
            f"/api/organization/{org_id}",
            f"Organization Retrieved: {'Data retrieved successfully' if organization else 'Organization not found'}",
            organization,
            200 if organization else 404
        ).get_response_data()
    except Exception as e:
        status_code = getattr(e, 'status_code', 500)
        return ResponseData(
            f"/api/organization/{org_id}", 
            f"Organization Not Retrieved: {e}", 
            None, 
            status_code
        ).get_response_data()
        
def get_org_data(org_id, auth_id):
    connection, cursor = None, None
    try:
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor(dictionary=True)
        
        if not verify_user_org(connection, auth_id, org_id):
            raise RouteException("User is not authorized to retrieve this organization", 401)
        
        query = """
            select
                o.id,
                o.name,
                o.owner,
                o.address,
                o.country,
                o.city,
                o.logo,
                o.created_at,
                o.updated_at,
                o.deleted_at
            from organizations o
            where o.id = %s
        """
        values = (org_id,)
        
        cursor.execute(query, values)
        return cursor.fetchone()
    except Exception as e:
        raise Exception(f"Failed to retrieve organization with id {org_id}")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
            
def verify_user_org(connection: mysql.connector.MySQLConnection, auth_id, org_id):
    try:
        cursor = connection.cursor()
        
        verify_user_org_query = """
            SELECT 
                COUNT(*)
            FROM USER_ORGANIZATIONS
            WHERE USER_ID = (SELECT ID FROM USERS WHERE AUTH_ID = %s)
            AND ORG_ID = %s
        """
        values = (auth_id, org_id,)
        
        cursor.execute(verify_user_org_query, values)
        result = cursor.fetchone()
        
        return result is not None and result[0] > 0
    except Exception:
        return False
    finally:
        cursor.close()

# Get Organizations by User ID

@organization_bp.route('/user/<user_id>', methods=['GET'])
@cross_origin()
def get_organizations(user_id):
    try:
        verify_user(request.headers, request.args)
        organizations = get_user_organizations(user_id)
        return ResponseData(
            f"/api/organization/user/{user_id}",
            f"Organizations Retrieved: {'Data retrieved successfully' if organizations else 'Organizations not found'}",
            organizations,
            200 if organizations else 404
        ).get_response_data()
    except Exception as e:
        return ResponseData(
            f"/api/organizations/user/{user_id}", 
            f"Organizations Not Retrieved: {e}", 
            None, 
            500
        ).get_response_data()
        
def get_user_organizations(user_id):
    connection, cursor = None, None
    try:
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor(dictionary=True)
        
        query = """
            select
                o.id,
                o.name,
                o.owner,
                o.address,
                o.country,
                o.city,
                o.logo,
                o.created_at,
                o.updated_at,
                o.deleted_at
            from organizations o
            inner join user_organizations u
            on o.id = u.org_id
            where u.user_id = %s
        """
        values = (user_id,)
        
        cursor.execute(query, values)
        return cursor.fetchall()
    except Exception as e:
        raise Exception(f"Failed to retrieve organizations for user with id {user_id}")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
            
# TODO (Not Needed Yet)
# Get Organization by ID

# endregion