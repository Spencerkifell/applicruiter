from flask import Blueprint, jsonify, request
from flask_cors import cross_origin, CORS
from global_utils import config
import mysql.connector

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
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor()

        query = """
            insert into jobs (
                title, 
                description, 
                level, 
                country, 
                city, 
                skills
            ) values (%s, %s, %s, %s, %s, %s)
        """
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
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor(dictionary=True)

        query = '''
            select 
                job_id,
                title,
                description,
                level,
                country,
                city,
                skills
            from jobs
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

def get_parsed_jobs(job_data):
    parsed_jobs = []
    if not job_data:
        return parsed_jobs
    for job in job_data:
        parsed_jobs.append({
            'job_id': job[0],
            'title': job[1],
            'description': job[2],
            'level': job[3],
            'country': job[4],
            'city': job[5],
            'skills': job[6]
        })
    return parsed_jobs

def get_jobs_by_id(job_id):
    try:
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor()

        # Execute the SQL query to retrieve resumes with the specified job ID
        query = """
            select 
                job_id,
                title,
                description,
                level,
                country,
                city,
                skills
            from jobs where job_id = %s
        """
        
        cursor.execute(query, (job_id,))
        return cursor.fetchall()
    except Exception as e:
        raise Exception("Error retrieving jobs by id:", str(e))
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# endregion