from flask import Flask
from flask_cors import CORS
from server import Server
from app_config import AppConfig

# Retrieve application configuration from environment variables
config = AppConfig()

# Create Flask application
app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

# Create the server
server = Server(app, config)

# TODO - Redirect this route to API documentation
@server.app.route('/api')
def hello_world():
    return 'TalentWave.AI API'

server.run()
