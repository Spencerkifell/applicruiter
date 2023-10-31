from flask import Flask
from flask_cors import CORS
from server import Server
# Create Flask application
app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

# Create the server
server = Server(app)

# TODO - Redirect this route to API documentation
@server.app.route('/api')
def hello_world():
    return 'AppliCruiter API'

server.run()
