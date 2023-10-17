from flask import Blueprint, jsonify, request, current_app
from flask_cors import cross_origin, CORS
from werkzeug.utils import secure_filename
import hashlib
import global_utils
import mysql.connector

db_config = global_utils.db_config
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

        for resume in uploaded_resumes:
            if resume.filename == '':
                return jsonify({"error": "One or more resume files have no selected file"}), 400

            # Securely generate a unique filename (Removes unsafe characters)
            safe_filename = secure_filename(resume.filename)

            # Generates a hash based off the file name to produce a unique file name
            filename_hash = hashlib.md5(resume.filename.encode()).hexdigest()

            # Combine the hash and the original filename (with an underscore)
            unique_filename = f"{filename_hash}_{safe_filename}".lower()
            
            resume_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], str(job_id))

            if not os.path.exists(resume_dir):
                os.makedirs(resume_dir)

            # Save the file in the job's directory
            file_path = os.path.join(resume_dir, unique_filename)
            resume.save(file_path)

            # Insert the file path into the database
            insert_resume_data(job_id, file_path)

        return jsonify({"message": "Resumes uploaded and data inserted successfully"}), 201
    except Exception as e:
        return jsonify({"error": "An error occurred"}), 500

def insert_resume_data(job_id, file_path):
    try:
        connection = mysql.connector.connect(**db_config)
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
    connection = mysql.connector.connect(**db_config)
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

# endregion