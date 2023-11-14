from flask import Blueprint, request
from flask_cors import cross_origin, CORS
from global_utils import ResponseData, config
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
        title = str(data.get('title')).capitalize()
        description = str(data.get('description')).capitalize()
        level = str(data.get('level')).capitalize()
        country = str(data.get('country')).capitalize()
        city = str(data.get('city')).capitalize()
        skills = data.get('skills')
        
        if all([title, description, level, country, city, skills]):
            returned_id = insert_job_data(title, description, level, country, city, skills)
            if not returned_id:
                raise Exception("Failed to create and insert job data")
            data['job_id'] = returned_id
            return ResponseData(
                "/api/job", 
                "Job Created: Data inserted successfully", 
                data, 
                201
            ).get_response_data()
        else:
            return ResponseData(
                "/api/job", 
                "Job Not Created: Missing required data", 
                None, 
                400
            ).get_response_data()
    except Exception as e:
        return ResponseData(
            "/api/job", 
            f"Job Not Created: {e}", 
            None, 
            500
        ).get_response_data()

    
def insert_job_data(title, description, level, country, city, skills):
    connection, cursor = None, None
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
    except Exception:
        return None
    finally:
        if connection and connection.is_connected():
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
        return ResponseData(
            "/api/job", 
            "Jobs Retrieved: Job data retrieved successfully", 
            jobs, 
            200
        ).get_response_data()
    except Exception as e:
        return ResponseData(
            "/api/job", 
            f"Jobs Not Retrieved: {e}", 
            None, 
            500
        ).get_response_data()
    
def get_all_jobs():
    connection, cursor = None, None
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
        raise Exception("Unable to retrieve job data")
    finally:
        if connection and connection.is_connected():
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
    connection, cursor = None, None
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
        raise Exception(f"Unable to retrieve job data with id {job_id}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# endregion