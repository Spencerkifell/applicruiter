from flask import Blueprint, jsonify, request, current_app
from flask_cors import cross_origin, CORS
from global_utils import config, get_signed_s3_url, parse_s3_location

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
            response_data = {
                "route": "/aws/resume/url",
                "message": "Retrieved signed file successfully" if url else "Unable to retrieve signed file from S3",
                "url": url if url else None
            }
            return jsonify(response_data), 200 if url else 500
    except Exception as e:
        return jsonify({
            "route": "/aws/resume/url", 
            "message": e
        }), 400