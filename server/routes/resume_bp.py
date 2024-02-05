from flask import Blueprint, request
from flask_cors import cross_origin, CORS
from werkzeug.utils import secure_filename
from global_utils import ResponseData, upload_file_to_s3, config, RouteException
import hashlib
import mysql.connector
import uuid
from jwt_utils import verify_user

resume_bp = Blueprint("resume", __name__)
CORS(resume_bp, resources={r"/api/*": {"origins": "*"}})

# region Post Resume Data

@resume_bp.route('/upload/<int:job_id>', methods=['POST'])
@cross_origin()
def upload_resume(job_id):
    try:
        if 'resumes' not in request.files:
            return ResponseData(
                f"/api/resume/upload/{job_id}", 
                "Failed To Upload Resumes: No resume files uploaded", 
                None, 
                400
            ).get_response_data()

        uploaded_resumes = request.files.getlist('resumes')

        resume_data = []
        for resume in uploaded_resumes:
            if resume.filename == '':
                return ResponseData(
                    f"/api/resume/upload/{job_id}", 
                    "Failed To Upload Resumes: One or more resume files have no selected file", 
                    None, 
                    400
                ).get_response_data()

            # Securely generate a unique filename (Removes unsafe characters)
            safe_filename = secure_filename(resume.filename)

            # Generates a hash based off the file name to produce a unique file name
            filename_hash = hashlib.md5(safe_filename.encode()).hexdigest()
            
            unique_id = str(uuid.uuid4())

            # Combine the hash and the original filename (with an underscore)
            unique_filename = f"{unique_id}{filename_hash}".lower()
            
            s3_bucket_name = 'talentwave'
            s3_desired_dir = f'uploads/{job_id}/{unique_filename}'
            
            s3_file_path = upload_file_to_s3(resume, s3_bucket_name, s3_desired_dir)
            
            # candidate_name = process_resume_data(abs_path, nlp, matcher)

            inserted_id = insert_resume_data(job_id, f'{s3_file_path}')
            resume_data.append({
                "id": inserted_id,
                "job_id": job_id,
                "pdf_data": f'{s3_file_path}',
                "similarity_score": None
            })
        return ResponseData(
            f"/api/resume/upload/{job_id}", 
            "Resumes Uploaded Successfully: Data inserted successfully", 
            resume_data, 
            201
        ).get_response_data()
    except Exception as e:
        return ResponseData(
            f"/api/resume/upload/{job_id}", 
            f"Resumes Not Uploaded: {e}", 
            None, 
            500
        ).get_response_data()

def insert_resume_data(job_id, file_path):
    connection, cursor = None, None
    try:
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor()
        
        query = """
            insert into resumes (
                job_id, 
                pdf_data, 
                similarity_score
            ) values (%s, %s, %s)
        """
        values = (job_id, file_path, None)

        cursor.execute(query, values)
        connection.commit()

        id = cursor.lastrowid
        if id is None:
            raise Exception()
        return id
    except Exception:
        raise Exception("Failed to insert resume data")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
            
def _extract_email(text):
    import re
    email = re.findall(r'[\w\.-]+@[\w\.-]+', text)
    return email[0] if email else None

# endregion

# region Ranked Resumes

# TODO catch errors if there is an issue ranking the resumes
@resume_bp.route('/rank/<int:job_id>', methods=['POST'])
def rank_resumes(job_id):
    from routes.utils.sort_jobs import rank_resumes
    
    data: dict = request.get_json()
    job_description = data.get("job_description", None)
        
    raw_resumes = get_resumes_by_job_id(job_id)
    parsed_resumes = get_parsed_resumes(raw_resumes)
    
    if parsed_resumes is None or len(parsed_resumes) == 0 or job_description is None:
        return ResponseData(
            f"/api/resume/rank/{job_id}", 
            "Resumes Ranked: No resumes found", 
            None, 
            400
        ).get_response_data()
    
    updated_resumes = rank_resumes(parsed_resumes, job_description)
    
    if updated_resumes is None or len(updated_resumes) == 0:
        return ResponseData(
            f"/api/resume/rank/{job_id}", 
            "Resumes Ranked: No resumes requiring update", 
            [], 
            200
        ).get_response_data()
    
    set_similarity_score(updated_resumes)
    
    return ResponseData(
        f"/api/resume/rank/{job_id}", 
        "Resumes Ranked: Resumes ranked successfully", 
        updated_resumes, 
        201
    ).get_response_data()

def set_similarity_score(updated_resumes):
    try:
        # Create a connection object
        connection = mysql.connector.connect(**config.db_config)

        # Create a cursor object to execute SQL queries
        cursor = connection.cursor()

        # Execute the SQL query to update the similarity score of the resume with the specified ID
        query = """
            UPDATE RESUMES 
            SET SIMILARITY_SCORE = %s 
            WHERE ID = %s
        """
        cursor.executemany(query, updated_resumes)
        connection.commit()
    except Exception as e:
        raise Exception("Error Setting Similarity Score:", str(e))
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def get_parsed_resumes(resume_data):
    parsed_resumes = []
    if not resume_data:
        return parsed_resumes
    for resume in resume_data:
        parsed_resumes.append({
            'id': resume[0],
            'job_id': resume[1],
            'pdf_data': resume[2],
            'similarity_score': resume[3]
        })
    return parsed_resumes

@resume_bp.route('/job/<int:job_id>', methods=['GET'])
@cross_origin()
def get_ranked_resumes(job_id):
    try:
        verified_id = verify_user(request.headers, request.args)
        
        resume_data = get_resumes_by_job_id(job_id, verified_id)
        return ResponseData(
            f"/api/resume/job/{job_id}", 
            "Resumes Retrieved: Ranked resume data retrieved successfully", 
            resume_data, 
            200
        ).get_response_data()
    except Exception as e:
        status_code = getattr(e, 'status_code', 500)
        return ResponseData(
            f"/api/resume/job/{job_id}", 
            f"Resumes Not Retrieved: {e}", 
            None, 
            status_code
        ).get_response_data()
        
def get_resumes_by_job_id(job_id, verified_id):
    try:
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor()
        
        if not verify_user_org(connection, verified_id, job_id):
            raise RouteException("User is not authorized to view resumes for this job")

        query = """
            select
                id,
                job_id,
                pdf_data,
                similarity_score
            from resumes
            where job_id = %s
        """
        cursor.execute(query, (job_id,))

        return cursor.fetchall()
    except Exception as e:
        raise Exception(f"Failed to retrieve resumes for job {job_id}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
        
def verify_user_org(connection: mysql.connector.MySQLConnection, auth_id, job_id):
    try:
        cursor = connection.cursor()
        
        verify_user_org_query = """
            SELECT 
                COUNT(*)
            FROM USER_ORGANIZATIONS
            WHERE USER_ID = (SELECT ID FROM USERS WHERE AUTH_ID = %s)
            AND ORG_ID = (SELECT ORG FROM JOBS WHERE ID = %s)
        """
        values = (auth_id, job_id,)
        
        cursor.execute(verify_user_org_query, values)
        result = cursor.fetchone()
        
        return result is not None and result[0] > 0
    except Exception:
        return False
    finally:
        cursor.close()
        
# endregion