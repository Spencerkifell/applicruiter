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
        email_verified = data.get('email_verified')
        first_name = data.get('given_name')
        last_name = data.get('family_name')
        picture = data.get('picture')
    
        # Verifies that all required data is present
        if all([auth_id, email, picture]) and email_verified != None:
            returned_id = insert_user_data(auth_id, email, email_verified, picture, first_name, last_name)
            if not returned_id:
                raise Exception("Failed to create and insert user data")
            return ResponseData(
                "/api/user", 
                "User Created: Data inserted successfully", 
                data, 
                201
            ).get_response_data()
    except Exception as e:
        return ResponseData(
            "/api/user", 
            f"User Not Created: {e}", 
            None, 
            500
        ).get_response_data()
        
def insert_user_data(auth_id, email, email_verified, picture, first_name = None, last_name = None):
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
                picture,
                registered
            ) values (%s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            auth_id, 
            email, 
            email_verified, 
            first_name, 
            last_name, 
            picture, 
            1 if all([first_name, last_name, email_verified]) else 0
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
                auth_id, 
                email,
                email_verified,
                first_name, 
                last_name, 
                picture,
                registered,
                created_at
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