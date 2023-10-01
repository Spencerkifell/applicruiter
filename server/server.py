from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from werkzeug.utils import secure_filename
import os
import hashlib

db_config = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': 'root',
    'database': 'MAIS2023'
}

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api')
def hello_world():
    return 'TalentWave.AI API'

@app.route('/api/jobs', methods=['POST'])
def insert_data_route():
    try:
        data = request.json
        title = data.get('title')
        description = data.get('description')
        level = data.get('level')
        country = data.get('country')
        city = data.get('city')
        skills = data.get('skills')
        
        if all([title, description, level, country, city, skills]):
            if insert_job_data(title, description, level, country, city, skills):
                return jsonify({"message": "Data inserted successfully", "job": data}), 201
            else:
                return jsonify({"error": "Failed to insert data"}), 500
        else:
            return jsonify({"error": "Missing required data"}), 400
    except Exception as e:
        return jsonify({"error": "An error occurred"}), 500
    
@app.route('/api/jobs', methods=['GET'])
def get_jobs_route():
    try:
        jobs = get_all_jobs()
        return jsonify({"message": "Job data retrieved successfully", "jobs": jobs}), 200
    except Exception as e:
        return jsonify({"error": "An error occurred"}), 500
    
@app.route('/api/upload_resume/<int:job_id>', methods=['POST'])
def upload_resume(job_id):
    try:
        if 'resumes' not in request.files:
            return jsonify({"error": "No resume files uploaded"}), 400

        uploaded_resumes = request.files.getlist('resumes')

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        for resume in uploaded_resumes:
            if resume.filename == '':
                return jsonify({"error": "One or more resume files have no selected file"}), 400

            # Securely generate a unique filename (Removes unsafe characters)
            safe_filename = secure_filename(resume.filename)

            # Generates a hash based off the file name to produce a unique file name
            filename_hash = hashlib.md5(resume.filename.encode()).hexdigest()

            # Combine the hash and the original filename (with an underscore)
            unique_filename = f"{filename_hash}_{safe_filename}".lower()

            resume_dir = os.path.join(app.config['UPLOAD_FOLDER'], str(job_id))

            if not os.path.exists(resume_dir):
                os.makedirs(resume_dir)

            # Save the file in the job's directory
            file_path = os.path.join(resume_dir, unique_filename)
            resume.save(file_path)

            # Insert the file path into the database
            insert_resume_data(cursor, job_id, file_path)

        # Commit the changes to the database
        connection.commit()

        return jsonify({"message": "Resumes uploaded and data inserted successfully"}), 201
    except Exception as e:
        return jsonify({"error": "An error occurred"}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def insert_resume_data(cursor, job_id, file_path):
    try:
        query = "INSERT INTO RESUMES (JOB_ID, PDF_DATA) VALUES (%s, %s)"
        values = (job_id, file_path)
        cursor.execute(query, values)
    except Exception as e:
        print("Error:", str(e))

def insert_job_data(title, description, level, country, city, skills):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        query = "INSERT INTO JOBS (TITLE, DESCRIPTION, LEVEL, COUNTRY, CITY, SKILLS) VALUES (%s, %s, %s, %s, %s, %s)"
        values = (title, description, level, country, city, skills)

        cursor.execute(query, values)
        connection.commit()

        return True
    except Exception as e:
        print("Error:", str(e))
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            
def get_all_jobs():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        # Replace 'jobs' with your actual table name
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

@app.route('/resume-ranking', methods=['POST'])
def resume_ranking():
    # Retrieve the request data
    data = request.json

    # Extract the job ID from the request data
    job_id = data.get('job_id')

    # Perform the resume ranking logic using the job ID
    # ...

    # Return the response
    return {'result': f'Ranked resumes for job ID: {job_id}'}

if __name__ == '__main__':
    app.config['UPLOAD_FOLDER'] = 'uploads'
    
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    
    app.run(port=5000, debug=True)