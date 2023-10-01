from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import mysql.connector

db_config = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': 'root',
    'database': 'MAIS2023'
}

app = Flask(__name__)

@app.route('/api')
def hello_world():
    return 'TalentWave.AI API'

@app.route('/api/job', methods=['POST'])
def insert_data_route():
    try:
        data = request.json
        title = data.get('title')
        description = data.get('description')
        level = data.get('level')
        country = data.get('country')
        city = data.get('city')
        skills = data.get('skills')

        if all([title, description, level, country, city, skills]):
            if insert_data(title, description, level, country, city, skills):
                return jsonify({"message": "Data inserted successfully"}), 201
            else:
                return jsonify({"error": "Failed to insert data"}), 500
        else:
            return jsonify({"error": "Missing required data"}), 400
    except Exception as e:
        return jsonify({"error": "An error occurred"}), 500
    
def insert_data(title, description, level, country, city, skills):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        query = "INSERT INTO JOBS (TITLE, DESCRIPTION, LEVEL, COUNTRY, CITY, SKILLS) VALUES (%s, %s, %s, %s, %s, %s)"
        values = (title, description, level, country, city, skills)

        cursor.execute(query, values)
        connection.commit()

        return True
    except Exception as e:
        print("Error:", str(e))
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/resume-ranking', methods=['POST'])
def resume_ranking():
    # Retrieve the request data
    data = request.json

    # Extract the job ID from the request data
    job_id = data.get('job_id')

    # Perform the resume ranking logic using the job ID
    # ...

    # Return the response
    return {'result': f'Ranked resumes for job ID: {job_id}'}

if __name__ == '__main__':
    app.run(port=5000, debug=True)