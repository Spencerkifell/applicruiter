from flask import Blueprint, jsonify, request
from flask_cors import cross_origin, CORS
from werkzeug.utils import secure_filename
from global_utils import config, upload_file_to_s3
import hashlib
import mysql.connector
import uuid

resume_bp = Blueprint("resume", __name__)
CORS(resume_bp, resources={r"/api/*": {"origins": "*"}})

# region Post Resume Data

@resume_bp.route('/upload/<int:job_id>', methods=['POST'])
@cross_origin()
def upload_resume(job_id):
    try:
        if 'resumes' not in request.files:
            return jsonify({"error": "No resume files uploaded"}), 400

        uploaded_resumes = request.files.getlist('resumes')

        resume_data = []
        for resume in uploaded_resumes:
            if resume.filename == '':
                return jsonify({"error": "One or more resume files have no selected file"}), 400

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
        return jsonify({"message": "Resumes uploaded and data inserted successfully", "resumes": resume_data}), 201
    except Exception as e:
        return jsonify({"error": e}), 400

def insert_resume_data(job_id, file_path):
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
            raise Exception("Failed to insert resume")
        
        return id
    except Exception as e:
        raise Exception("Error Inserting Resume Data:", str(e))
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            
def _extract_email(text):
    import re
    email = re.findall(r'[\w\.-]+@[\w\.-]+', text)
    return email[0] if email else None

# endregion

# region Ranked Resumes

# TODO FIX ENTIRE METHOD SINCE SHOULD BE A POST
@resume_bp.route('/rank/<int:job_id>', methods=['POST'])
def rank_resumes(job_id):
    from routes.utils.sort_jobs import rank_resumes
    
    data: dict = request.get_json()
    job_description = data.get("job_description", None)
        
    raw_resumes = get_resumes_by_job_id(job_id)
    parsed_resumes = get_parsed_resumes(raw_resumes)
    
    # TODO fix all return statements to follow specific format
    if parsed_resumes is None or len(parsed_resumes) == 0 or job_description is None:
        return jsonify({"error": "No resumes found"}), 401
    
    updated_resumes = rank_resumes(parsed_resumes, job_description)
    
    if updated_resumes is None or len(updated_resumes) == 0:
        return jsonify({
            "message": "No resumes requiring update",
            "updated_resumes": []
        }), 200
    
    set_similarity_score(updated_resumes)
    
    return jsonify({
        "message": "Resumes ranked successfully", 
        "updated_resumes": updated_resumes
    }), 200

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

def get_resumes_by_job_id(job_id):
    try:
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor()

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
        raise Exception("Error Retrieving Resumes:", str(e))
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@resume_bp.route('/get/ranking/<int:job_id>', methods=['GET'])
def get_ranked_resumes(job_id):
    try:
        resume_data = get_all_rankings_by_job_id(job_id)
        return jsonify({"message": "Ranked resume data retrieved successfully", "resume_data": resume_data}), 200
    except Exception as e:
        return jsonify({"error": "An error occurred"}), 500

def get_all_rankings_by_job_id(job_id):
    try:
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor(dictionary=True)

        query = '''
            select 
                id,
                pdf_data,
                similarity_score
            from resumes
            where job_id = %s;
        '''
        
        cursor.execute(query, (job_id,))
        return cursor.fetchall()
    except Exception as e:
        raise Exception("Error Retrieving Ranked Resumes:", str(e))
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# endregion