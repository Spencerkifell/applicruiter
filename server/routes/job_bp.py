from flask import Blueprint, request
from flask_cors import cross_origin, CORS
from global_utils import ResponseData, PropertyValidator, RouteException, config
from jwt_utils import verify_user
import mysql.connector

job_bp = Blueprint("job", __name__, url_prefix='/api/job')
CORS(job_bp, resources={r"/api/*": {"origins": "*"}})

job_attributes = ['org', 'title', 'description', 'level', 'country', 'city', 'skills']

# region Post Job Data

@job_bp.route("", methods=["POST"])
@job_bp.route("/", methods=["POST"])
@cross_origin()
def insert_data_route():
    try:
        verified_id = verify_user(request.headers, request.args)
        
        data: dict = request.get_json()
                
        job_data = data.get('job')
        validated_job_data, job_data_is_valid = PropertyValidator(job_data, job_attributes).get_validated_values()
                
        if all([validated_job_data, job_data_is_valid, verified_id]):
            returned_id = insert_job_data(validated_job_data, verified_id)
            if not returned_id:
                raise Exception("Failed to create and insert job data")
            job_data['id'] = returned_id
            return ResponseData(
                "/api/job", 
                "Job Created: Data inserted successfully", 
                job_data, 
                201
            ).get_response_data()
        else:
            raise RouteException("Missing required data", 400)
    except Exception as e:
        status_code = getattr(e, 'status_code', 500)
        return ResponseData(
            "/api/job", 
            f"Job Not Created: {e}", 
            None, 
            status_code
        ).get_response_data()

    
def insert_job_data(job_data: dict, user_id: int):
    connection, cursor = None, None
    try:
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor()
        
        connection.start_transaction()
        
        if not verify_org_exists(connection, job_data.get('org')):
            raise RouteException("Organization does not exist", 404)
        
        if not verify_user_org(connection, job_data.get('org'), user_id):
            raise RouteException("User is not part of the organization", 403)

        job_query = """
            INSERT INTO jobs (
                org,
                title,
                description,
                level,
                country,
                city,
                skills
            ) VALUES (%s, %s, %s, %s, %s, %s, %s);
        """
        
        job_values = (
            job_data.get('org'),
            job_data.get('title'),
            job_data.get('description'),
            job_data.get('level'),
            job_data.get('country'),
            job_data.get('city'),
            job_data.get('skills')
        )
        cursor.execute(job_query, job_values)
                
        job_id = cursor.lastrowid
            
        connection.commit()
        return job_id
    except Exception:
        connection.rollback()
        return None
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()


def verify_org_exists(connection: mysql.connector.MySQLConnection, org_id):
    try:
        cursor = connection.cursor()
        
        verify_org_query = """
            SELECT
                COUNT(*)
            FROM ORGANIZATIONS
            WHERE ID = %s
        """
        values = (org_id,)
        
        cursor.execute(verify_org_query, values)
        result = cursor.fetchone()
        
        return result is not None and result[0] > 0
    except Exception:
        return False
    finally:
        cursor.close()

        
def verify_user_org(connection: mysql.connector.MySQLConnection, org_id, user_id):
    try:
        cursor = connection.cursor()
        
        verify_user_org_query = """
            SELECT 
                COUNT(*) 
            FROM USER_ORGANIZATIONS
            WHERE ORG_ID = %s 
            AND USER_ID = (SELECT ID FROM USERS WHERE AUTH_ID = %s)
        """
        values = (org_id, user_id,)
        
        cursor.execute(verify_user_org_query, values)
        result = cursor.fetchone()
        
        return result is not None and result[0] > 0
    except Exception:
        return False
    finally:
        cursor.close()

# endregion

# region Get Job Data

# Get job data by organization ID

@job_bp.route('/organization/<org_id>', methods=['GET'])
@cross_origin()
def get_job_by_org(org_id):
    try:
        verified_id = verify_user(request.headers, request.args)
        job_data = get_jobs_by_org(org_id, verified_id)
                
        if not job_data:
            raise RouteException(f"No jobs founds with organization id {org_id}", 404)
        return ResponseData(
            f"/api/job/org/{org_id}", 
            "Jobs Retrieved: Job data retrieved successfully", 
            get_parsed_jobs(job_data), 
            200
        ).get_response_data()
    except Exception as e:
        status_code = getattr(e, 'status_code', 500)
        return ResponseData(
            f"/api/job/org/{org_id}", 
            f"Jobs Not Retrieved: {e}", 
            None, 
            status_code
        ).get_response_data()


def get_jobs_by_org(org_id, verified_id):
    connection, cursor = None, None
    try:
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor()
                
        if not verify_user_org(connection, org_id, verified_id):
            raise RouteException("User is not part of the organization", 403)
        
        query = '''
            select
                id,
                org,
                title,
                description,
                level,
                country,
                city,
                skills,
                created_at,
                updated_at,
                deleted_at
            from jobs
            where org = %s
        '''
        values = (org_id,)
        cursor.execute(query, values)
        
        return cursor.fetchall()
    except Exception:
        connection.rollback()
        return None
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Original get jobs route

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
    except Exception as e:
        status_code = getattr(e, 'status_code', 500)
        return ResponseData(
            "/api/job", 
            f"Jobs Not Retrieved: {e}", 
            None, 
            status_code
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
            'id': job[0],
            'org': job[1],
            'title': job[2],
            'description': job[3],
            'level': job[4],
            'country': job[5],
            'city': job[6],
            'skills': job[7],
            'created_at': job[8],
            'updated_at': job[9],
            'deleted_at': job[10]
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