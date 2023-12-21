from flask import Blueprint, request
from flask_cors import cross_origin, CORS
from global_utils import ResponseData, config
import mysql.connector

user_bp = Blueprint("user", __name__, url_prefix='/api/user')
CORS(user_bp, resources={r"/api/*": {"origins": "*"}})

# region Create User

@user_bp.route('/', methods=['POST'])
@cross_origin()
def create_user():
    try:
        data = request.get_json()
        
        # Get individual data from request body
        auth_id = data.get('sub')
        email = data.get('email')
        email_verified = int(data.get('email_verified'))
        first_name = data.get('given_name')
        last_name = data.get('family_name')
        picture = data.get('picture')
        
        # Verifies that all required data is present
        if all([auth_id, email, picture, first_name, last_name]) and email_verified != None:
            # Desired properties to send back to client
            response_data = {
                'auth_id': auth_id,
                'first_name': first_name,
                'last_name': last_name,
                'picture': picture,
                'email': email,
                'email_verified': email_verified,
                'created_at': None,
                'updated_at': None,
                'deleted_at': None
            }
            returned_id = insert_user_data(auth_id, email, email_verified, picture, first_name, last_name)
            if not returned_id:
                raise Exception("Failed to create and insert user data")
            return ResponseData(
                "/api/user", 
                "User Created: Data inserted successfully", 
                {**response_data, 'id': returned_id}, 
                201
            ).get_response_data()
    except Exception as e:
        return ResponseData(
            "/api/user", 
            f"User Not Created: {e}", 
            None, 
            500
        ).get_response_data()
        
def insert_user_data(auth_id, email, email_verified, picture, first_name, last_name):
    connection, cursor = None, None
    try:
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor()
        
        query = """
            insert into users (
                auth_id, 
                email,
                email_verified,
                first_name, 
                last_name, 
                picture
            ) values (%s, %s, %s, %s, %s, %s)
        """
        
        values = (
            auth_id, 
            email, 
            email_verified, 
            first_name, 
            last_name, 
            picture,
        )

        cursor.execute(query, values)
        connection.commit()

        return cursor.lastrowid
    except Exception:
        raise Exception("Failed to insert user data")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
            
# endregion

# region Get User

@user_bp.route('/<string:id>', methods=['GET'])
@cross_origin()
def get_user(id):
    try:
        user = get_user_data(id)
        return ResponseData(
            f"/api/user/{id}", 
            f"User Retrieved: {'Data retrieved successfully' if user else 'User not found'}", 
            user, 
            200 if user else 404
        ).get_response_data()
    except Exception as e:
        return ResponseData(
            f"/api/user/{id}", 
            f"User Not Retrieved: {e}", 
            None, 
            500
        ).get_response_data()
        
def get_user_data(id):
    connection, cursor = None, None
    try:
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor(dictionary=True)
        
        query = """
            select
                id,
                auth_id, 
                email,
                email_verified,
                first_name, 
                last_name, 
                picture,
                created_at,
                updated_at,
                deleted_at
            from users
            where auth_id = %s
        """
        values = (id,)

        cursor.execute(query, values)
        result = cursor.fetchone()

        return result
    except Exception as e:
        raise Exception(f"Failed to retrieve user data with id {id}")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# endregion