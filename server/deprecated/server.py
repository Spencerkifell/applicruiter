import os
import boto3
from flask import Flask
from flask_cors import CORS
from dotenv import dotenv_values
from routes.job_bp import job_bp
from routes.resume_bp import resume_bp
# from routes.aws_bp import aws_bp

# Load environment variables from the .env file
config = dotenv_values(".env")

def get_env(key):
    try:
        return config[key]
    except KeyError:
        raise Exception(f"Environment variable {key} not found.")

db_config = {
    'host': get_env('DB_HOST'),
    'port': get_env('DB_PORT'),
    'user': get_env('DB_USER'),
    'password': get_env('DB_PASS'),
    'database': get_env('DB_NAME')
}

s3_client_credentials = {
    'aws_access_key': get_env('AWS_ACCESS_KEY'),
    'aws_secret_key': get_env('AWS_SECRET_KEY'),
    'aws_region': get_env('AWS_REGION'),
}

# https://github.com/boto/boto3
session = boto3.Session(**s3_client_credentials)

# You can now use Boto3 to interact with AWS services
s3_client = session.client("s3")
# For example, you can list S3 buckets
buckets = s3_client.list_buckets()
for bucket in buckets["Buckets"]:
    print("S3 Bucket: " + bucket["Name"])



app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register modular blueprints / routes
app.register_blueprint(resume_bp, url_prefix='/api/resume')
app.register_blueprint(job_bp, url_prefix='/api/job')
# app.register_blueprint(aws_bp, url_prefix='/api/aws')

@app.route('/api')
def hello_world():
    return 'TalentWave.AI API'

if __name__ == '__main__':
    app.config['UPLOAD_FOLDER'] = 'uploads'
    
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    
    app.run(port=5000, debug=True)