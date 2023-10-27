from flask import Blueprint, jsonify, request
from flask_cors import cross_origin, CORS
import global_utils
import mysql.connector

db_config = global_utils.db_config
job_bp = Blueprint("job", __name__, url_prefix='/api/aws')
CORS(job_bp, resources={r"/api/*": {"origins": "*"}})

