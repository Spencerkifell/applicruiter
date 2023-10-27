from flask import Blueprint, jsonify, request
from flask_cors import cross_origin, CORS
from werkzeug.utils import secure_filename
from botocore.exceptions import NoCredentialsError
from main import s3_client
import hashlib
import global_utils
import mysql.connector

db_config = global_utils.db_config
aws_bp = Blueprint("aws", __name__, url_prefix='/api/aws')
CORS(aws_bp, resources={r"/api/*": {"origins": "*"}})

# region Upload File to S3 

@aws_bp.route("/upload<int:job_id>", methods=["POST"])
@cross_origin()
def upload_file(job_id):
    import pdb
    pdb.set_trace()
    try:
        if 'resumes' not in request.files:
            return jsonify({"error": "No resume files uploaded"}), 400
        
        uploaded_resumes = request.files.getlist('resumes')
        
        for resume in uploaded_resumes:
            if resume.filename == '':
                return jsonify({"error": "One or more resume files have no selected file"}), 400
    
            # Securely generate a unique filename (Removes unsafe characters)
            safe_filename = secure_filename(resume.filename)
            
            # Generates a hash based on the file name to produce a unique file name
            filename_hash = hashlib.md5(resume.filename.encode()).hexdigest()
            
            # Combine the hash and the original filename (with an underscore)
            unique_filename = f"{filename_hash}_{safe_filename}".lower()
            
            # Define the S3 bucket and directory path
            s3_bucket_name = 'talentwave'
            s3_desired_dir = f'uploads/{job_id}'
            
            # Upload file to bucket
            s3_file_path = f'{s3_desired_dir}/{unique_filename}'
            
            try:
                pass # TODO
                # s3_client.upload_fileobj(resume, s3_bucket_name, s3_file_path)
            except NoCredentialsError:
                return jsonify({"error": "AWS credentials not found"}), 400
            except Exception as e:
                return jsonify({"error": "An error occurred"}), 500
            
            s3_object_url = f'https://{s3_bucket_name}.s3.amazonaws.com/{s3_file_path}'
            
            return jsonify({"message": "File uploaded successfully", "url": s3_object_url}), 201
            
    except Exception as e:
        return jsonify({"error": "An error occurred"}), 500

# endregion