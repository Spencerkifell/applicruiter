from boto3.session import Session
from app_config import AppConfig
import mysql.connector

config = AppConfig()

def truncate_s3_bucket(client, bucket):
    if bucket is None or client is None:
        return
    try:
        objects = client.list_objects(Bucket=bucket)
        if 'Contents' not in objects:
            return
        for obj in objects['Contents']:
            client.delete_object(Bucket=bucket, Key=obj['Key'])
    except Exception as e:
        raise Exception("Error truncating S3 bucket:", str(e))

def truncate_database_tables(db_config: dict, file_path: str = './database/truncate_tables.sql'): 
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor()
    try:
        with open(file_path, 'r') as f:
            query = f.read()
        cursor.execute(query, multi=True)
    except Exception as e:
        raise Exception("Error truncating database:", str(e))
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
    
def main():
    # Initialize AWS session and client
    aws_session = Session(**config.s3_client_credentials)
    s3_client = aws_session.client('s3')
    s3_bucket_name = 'talentwave'
    
    # Perform truncate operations
    truncate_s3_bucket(s3_client, s3_bucket_name)
    truncate_database_tables(config.db_config)
    
    print ("Truncate Operations Completed")
        
if __name__ == '__main__':
    main()
