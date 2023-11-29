from app_config import AppConfig
from boto3.session import Session
from botocore.exceptions import NoCredentialsError
from flask import jsonify

config = AppConfig()

aws_session = Session(**config.s3_client_credentials)
s3_client = aws_session.client('s3')

def get_signed_s3_url(bucket_name, bucket_path):
    try:
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': bucket_name, 
                'Key': bucket_path, 
                'ResponseContentDisposition': 'inline'
            },
            ExpiresIn=3600
        )
        return presigned_url
    except NoCredentialsError:
        raise Exception("AWS credentials not found")
    except Exception as e:
        raise Exception("An error occured when retrieving the file from S3")
    
def upload_file_to_s3(resume, bucket_name, file_path):
    try:
        s3_client.upload_fileobj(resume, bucket_name, file_path, ExtraArgs={'ContentType': 'application/pdf', 'ContentDisposition': 'inline'})
        return f'{bucket_name}/{file_path}'
    except NoCredentialsError:
        raise Exception("AWS credentials not found")
    except Exception as e:
        return Exception("An error occcured when uploading the file to S3")

def parse_s3_location(pdf_location):
    deconstructed_path = pdf_location.split('/')
    bucket_name = deconstructed_path.pop(0)
    bucket_path = '/'.join(deconstructed_path)
    return {'bucket_name': bucket_name, 'bucket_path': bucket_path}

class ResponseData:
    def __init__(self, route, message, data, response_code):
        self.route = route
        self.message = message
        self.data = data
        self.response_code = response_code
        
    def get_response_data(self):
        return jsonify ({
            "route": self.route,
            "message": self.message,
            "data": self.data
        }), self.response_code
        
    def __repr__(self):
        return f"ResponseData(route={self.route}, message={self.message}, data={self.data})"
    
class AuthHeaderException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)