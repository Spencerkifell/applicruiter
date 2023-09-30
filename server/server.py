from flask import Flask, request

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

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
    app.run()