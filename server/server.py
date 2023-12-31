from routes.job_bp import job_bp
from routes.resume_bp import resume_bp
from routes.aws_bp import aws_bp
from routes.user_bp import user_bp

class Server:
    def __init__(self, app):
        self.app = app
        self._register_blueprints()
    
    def _register_blueprints(self):
        # Register modular blueprints / routes
        self.app.register_blueprint(resume_bp, url_prefix='/api/resume')
        self.app.register_blueprint(job_bp, url_prefix='/api/job')
        self.app.register_blueprint(aws_bp, url_prefix='/api/aws')
        self.app.register_blueprint(user_bp, url_prefix='/api/user')
    def run(self):
        self.app.run(port=5000)
        # In prod use gunicorn and pass