from dotenv import dotenv_values
# import os

class AppConfig:
    def __init__(self):
        # Load environment variables from the .env file
        self.config = dotenv_values(".env")
        # When in prod use os variable and comment out dotenv logic
        
        self.db_config = {
            'host': self.get_env('DB_HOST'),
            'port': self.get_env('DB_PORT'),
            'user': self.get_env('DB_USER'),
            'password': self.get_env('DB_PASS'),
            'database': self.get_env('DB_NAME')
        }

        self.s3_client_credentials = {
            'aws_access_key_id': self.get_env('AWS_ACCESS_KEY'),
            'aws_secret_access_key': self.get_env('AWS_SECRET_KEY'),
            'region_name': self.get_env('AWS_REGION'),
        }
        
        self.auth0_config = {
            'audience': self.get_env('AUTH0_AUDIENCE'),
            'domain': self.get_env('AUTH0_DOMAIN'),
        }
        
    def get_env(self, key):
        try:
            return self.config[key]
        except KeyError:
            raise Exception(f"Environment variable {key} not found.")
        
    # def get_env(self, key):
    #     try:
    #         return os.environ[key]
    #     except KeyError:
    #         raise Exception(f"Environment variable {key} not found.")