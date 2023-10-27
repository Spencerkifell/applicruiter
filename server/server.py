import os
import boto3
from routes.job_bp import job_bp
from routes.resume_bp import resume_bp
from app_config import AppConfig

class Server:
    def __init__(self, app, config: AppConfig):
        self.app = app
        self.config = config
        self.aws_session = self._get_aws_session()
        self._configure_app()
        self._register_blueprints()
    
    def _configure_app(self):
        self.app.config['UPLOAD_FOLDER'] = 'uploads'
        if not os.path.exists(self.app.config['UPLOAD_FOLDER']):
            os.makedirs(self.app.config['UPLOAD_FOLDER'])
     
    def _get_aws_session(self):
        # Initialize and return an AWS session
        return boto3.Session(**self.config.s3_client_credentials)
    
    def _register_blueprints(self):
        # Register modular blueprints / routes
        self.app.register_blueprint(resume_bp, url_prefix='/api/resume')
        self.app.register_blueprint(job_bp, url_prefix='/api/job')
        
    def run(self):
        self.app.run(port=5000, debug=True)
