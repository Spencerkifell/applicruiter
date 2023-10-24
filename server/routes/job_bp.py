from flask import Blueprint, jsonify, request
from flask_cors import cross_origin, CORS
import global_utils
import mysql.connector

db_config = global_utils.db_config
job_bp = Blueprint("job", __name__, url_prefix='/api/job')
CORS(job_bp, resources={r"/api/*": {"origins": "*"}})

# region Post Job Data

@job_bp.route("", methods=["POST"])
@job_bp.route("/", methods=["POST"])
@cross_origin()
def insert_data_route():
    try:
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')
        level = data.get('level')
        country = data.get('country')
        city = data.get('city')
        skills = data.get('skills')
        
        if all([title, description, level, country, city, skills]):
            returned_id = insert_job_data(title, description, level, country, city, skills)
            if returned_id:
                data['job_id'] = returned_id
                return jsonify({"message": "Data inserted successfully", "job": data}), 201
            else:
                return jsonify({"error": "Failed to insert data"}), 500
        else:
            return jsonify({"error": "Missing required data"}), 400
    except Exception as e:
        return jsonify({"error": "An error occurred"}), 500
    
def insert_job_data(title, description, level, country, city, skills):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        query = "INSERT INTO JOBS (TITLE, DESCRIPTION, LEVEL, COUNTRY, CITY, SKILLS) VALUES (%s, %s, %s, %s, %s, %s)"
        values = (title, description, level, country, city, skills)

        cursor.execute(query, values)
        connection.commit()
        
        return cursor.lastrowid
    except Exception as e:
        print("Error:", str(e))
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# endregion

# region Get Job Data

@job_bp.route('', methods=['GET'])
@job_bp.route('/', methods=['GET'])
@cross_origin()
def get_jobs_route():
    try:
        jobs = get_all_jobs()
        return jsonify({"message": "Job data retrieved successfully", "jobs": jobs}), 200
    except Exception as e:
        return jsonify({"error": "An error occurred"}), 500
    
def get_all_jobs():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        query = '''
            SELECT 
                job_id,
                title, 
                description,
                level,
                country,
                city,
                skills
            FROM JOBS
        '''
        
        cursor.execute(query)
        return cursor.fetchall()
    except Exception as e:
        raise Exception("Error retrieving jobs:", str(e))
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# endregion

# region Get Job Data by ID

def get_jobs_by_job_id(job_id):

    # Create a cursor object to execute SQL queries
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor()

    # Execute the SQL query to retrieve resumes with the specified job ID
    query = "SELECT * FROM JOBS WHERE JOB_ID = %s"
    cursor.execute(query, (job_id,))

    # Fetch all the rows returned by the query
    jobs = cursor.fetchall()

    # Close the cursor and database connection
    cursor.close()
    connection.close()

    return jobs

# endregion