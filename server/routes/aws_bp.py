from flask import Blueprint, request
from flask_cors import CORS
from global_utils import ResponseData, get_signed_s3_url, parse_s3_location

aws_bp = Blueprint("aws", __name__, url_prefix='/api/aws')
CORS(aws_bp, resources={r"/api/*": {"origins": "*"}})

@aws_bp.route('/resume/url', methods=['POST'])
def get_signed_file_url():
    try:
        data = request.get_json()
        path = data.get('path')
        
        if not path:
            raise Exception("Unable to get path from request body")
        
        url = get_signed_s3_url(**parse_s3_location(path))
        
        if url:
            return ResponseData(
                "/api/aws/resume/url", 
                "Data Retrieval: Retrieved signed file successfully" if url else "Data Retrieval: Unable to retrieve signed file from S3",
                url, 
                201 if url else 500
            ).get_response_data()
    except Exception as e:
        return ResponseData(
            "/api/aws/resume/url", 
            f"Data Retrieval: {e}", 
            None, 
            400
        ).get_response_data()