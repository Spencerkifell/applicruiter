from flask import Flask
from flask_cors import CORS
import os
from routes.job_bp import job_bp
from routes.resume_bp import resume_bp

db_config = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': 'root',
    'database': 'MAIS2023'
}

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register modular blueprints / routes
app.register_blueprint(resume_bp, url_prefix='/api/resume')
app.register_blueprint(job_bp, url_prefix='/api/job')

@app.route('/api')
def hello_world():
    return 'TalentWave.AI API'

if __name__ == '__main__':
    app.config['UPLOAD_FOLDER'] = 'uploads'
    
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    
    app.run(port=5000, debug=True)