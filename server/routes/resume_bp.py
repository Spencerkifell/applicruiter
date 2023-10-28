from flask import Blueprint, jsonify, request, current_app
from flask_cors import cross_origin, CORS
from werkzeug.utils import secure_filename
from global_utils import config, upload_file_to_s3
# from PyPDF2 import PdfReader
# from spacy.matcher import Matcher
import hashlib
import mysql.connector
# import spacy

resume_bp = Blueprint("resume", __name__)
CORS(resume_bp, resources={r"/api/*": {"origins": "*"}})

# region Post Resume Data

@resume_bp.route('/upload/<int:job_id>', methods=['POST'])
@cross_origin()
def upload_resume(job_id):
    import os
    try:
        if 'resumes' not in request.files:
            return jsonify({"error": "No resume files uploaded"}), 400

        uploaded_resumes = request.files.getlist('resumes')
    
        # Load the spacy model to be used to extract crucial information from the resume to store
        # nlp = spacy.load("en_core_web_sm")

        # initialize matcher with a vocab
        # matcher = Matcher(nlp.vocab)
        # First name and Last name are always Proper Nouns
        # pattern = [{'POS': 'PROPN'}, {'POS': 'PROPN'}]
        # matcher.add('NAME', [pattern])

        for resume in uploaded_resumes:
            if resume.filename == '':
                return jsonify({"error": "One or more resume files have no selected file"}), 400

            # Securely generate a unique filename (Removes unsafe characters)
            safe_filename = secure_filename(resume.filename)

            # Generates a hash based off the file name to produce a unique file name
            filename_hash = hashlib.md5(resume.filename.encode()).hexdigest()

            # Combine the hash and the original filename (with an underscore)
            unique_filename = f"{filename_hash}_{safe_filename}".lower()
            
            s3_bucket_name = 'talentwave'
            s3_desired_dir = f'uploads/{job_id}/{unique_filename}'
            
            s3_file_path = upload_file_to_s3(resume, s3_bucket_name, s3_desired_dir)
            
            # candidate_name = process_resume_data(abs_path, nlp, matcher)

            # Insert the file path into the database
            insert_resume_data(job_id, f'{s3_file_path}')
        return jsonify({"message": "Resumes uploaded and data inserted successfully"}), 201
    except Exception as e:
        return jsonify({"error": e}), 400

def insert_resume_data(job_id, file_path):
    try:
        connection = mysql.connector.connect(**config.db_config)
        cursor = connection.cursor()
        
        query = "INSERT INTO RESUMES (JOB_ID, PDF_DATA, SIMILARITY_SCORE) VALUES (%s, %s, %s)"
        values = (job_id, file_path, None)
        
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
            
# def process_resume_data(file_path, nlp, matcher) -> str:
#     try:
#         text = extract_text_from_pdf(file_path)
#         doc = nlp(text)
#         matches = matcher(doc)
#         import pdb
#         pdb.set_trace()
#         return None if not matches else doc[matches[0][1]:matches[0][2]]
#     except Exception as e:
#         raise Exception("Error Processing Resume Data:", str(e))
    
# def extract_text_from_pdf(pdf_path):
#     try:
#         pdf_file = open(pdf_path, "rb")

#         pdf_reader = PdfReader(pdf_file)
        
#         all_text = ""
#         for page in pdf_reader.pages:
#             text = page.extract_text()
#             all_text += text

#         return all_text
#     except Exception as e:
#         raise Exception("Error Extracting Text from PDF:", str(e))
#     finally:
#         pdf_file.close()


# endregion

# region Ranked Resumes

@resume_bp.route('/rank/<int:job_id>', methods=['GET'])
def rank_resumes(job_id):
    from routes.job_bp import get_jobs_by_job_id
    from routes.utils.sort_jobs import JobSorting
    rankedJobs = JobSorting.rank_resumes(get_resumes_by_job_id(job_id), get_jobs_by_job_id(job_id)[0], 10)
    # Return the response
    return rankedJobs

def get_resumes_by_job_id(job_id):
    # Create a cursor object to execute SQL queries
    connection = mysql.connector.connect(**config.db_config)
    cursor = connection.cursor()

    # Execute the SQL query to retrieve resumes with the specified job ID
    query = "SELECT * FROM RESUMES WHERE JOB_ID = %s"
    cursor.execute(query, (job_id,))

    # Fetch all the rows returned by the query
    resumes = cursor.fetchall()

    # Close the cursor and database connection
    cursor.close()
    connection.close()

    return resumes

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
            SELECT 
                id,
                pdf_data,
                similarity_score
            FROM RESUMES;
        '''
        
        cursor.execute(query)
        return cursor.fetchall()
    except Exception as e:
        raise Exception("Error Retrieving Ranked Resumes:", str(e))
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# endregion