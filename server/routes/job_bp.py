from flask import Blueprint, request
from flask_cors import cross_origin, CORS
from global_utils import ResponseData, AuthHeaderException, config
from jwt_utils import verify_user
import mysql.connector

job_bp = Blueprint("job", __name__, url_prefix='/api/job')
CORS(job_bp, resources={r"/api/*": {"origins": "*"}})

# region Post Job Data

@job_bp.route("", methods=["POST"])
@job_bp.route("/", methods=["POST"])
@cross_origin()
def insert_data_route():
    try:
        data: dict = request.get_json()
        
        job_data = data.get('job')
        email_data = data.get('emails')
        
        title = str(job_data.get('title')).capitalize()
        description = str(job_data.get('description')).capitalize()
        level = str(job_data.get('level')).capitalize()
        country = str(job_data.get('country')).capitalize()
        city = str(job_data.get('city')).capitalize()
        skills = job_data.get('skills')
        
        if all([title, description, level, country, city, skills]):
            returned_id = insert_job_data(title, description, level, country, city, skills, email_data)
            if not returned_id:
                raise Exception("Failed to create and insert job data")
            job_data['job_id'] = returned_id
            return ResponseData(
                "/api/job", 
                "Job Created: Data inserted successfully", 
                job_data, 
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

    
def insert_job_data(title, description, level, country, city, skills, emails = None):
    connection, cursor = None, None
    try:
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor()

        job_query = """
            INSERT INTO jobs (
                title,
                description,
                level,
                country,
                city,
                skills
            ) VALUES (%s, %s, %s, %s, %s, %s);
        """
        job_values = (title, description, level, country, city, skills)
        cursor.execute(job_query, job_values)
                
        job_id = cursor.lastrowid
        
        if emails and len(emails) != 0:
            job_user_query = """
                INSERT INTO job_users (job_id, user_id)
                SELECT %s, auth_id AS user_id
                FROM users
                WHERE email in ({})
            """.format(', '.join(['%s'] * len(emails)))
            values = (job_id, *emails,)
            cursor.execute(job_user_query, values)
            
        connection.commit()
        return job_id
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
        verified_id = verify_user(request.headers, request.args)
        jobs = get_all_jobs(verified_id)
        return ResponseData(
            "/api/job", 
            "Jobs Retrieved: Job data retrieved successfully", 
            jobs, 
            200
        ).get_response_data()
    except AuthHeaderException as e:
        return ResponseData(
            "/api/job", 
            f"Jobs Not Retrieved: {e}", 
            None, 
            401
        ).get_response_data()
    except Exception as e:
        return ResponseData(
            "/api/job", 
            f"Jobs Not Retrieved: {e}", 
            None, 
            500
        ).get_response_data()
    
def get_all_jobs(user_id):
    connection, cursor = None, None
    try:
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor(dictionary=True)
        
        query = '''
            select 
                jobs.job_id as job_id,
                title,
                description,
                level,
                country,
                city,
                skills
            from jobs
            inner join job_users
            on jobs.job_id = job_users.job_id
            where job_users.user_id = %s
        '''
        
        values = (user_id,)
        cursor.execute(query, values)
        
        return cursor.fetchall()
    except Exception:
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
    except Exception:
        raise Exception(f"Unable to retrieve job data with id {job_id}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# endregion

# region JWT Methods


    
# endregion