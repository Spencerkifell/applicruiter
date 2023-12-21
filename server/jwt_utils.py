from six.moves.urllib.request import urlopen
from six.moves.urllib.error import URLError
from global_utils import AuthHeaderException, config
from jose import jwt
import json

AUTH0_DOMAIN = config.auth0_config.get('domain')
AUTH0_AUDIENCE = config.auth0_config.get('audience')

def verify_user(headers, args):
    auth_header: str = headers.get('Authorization')
    if auth_header is None:
        raise AuthHeaderException("Authorization header is missing")
    
    token = auth_header.replace('Bearer ', '')
    
    token_payload = get_jwt_payload(token)
    
    if token_payload is None:
        raise AuthHeaderException("Invalid or expired token")
    
    token_user_id = token_payload.get('sub')
    request_user_id = args.get('userAuthId')
    
    if token_user_id != request_user_id:
        raise AuthHeaderException("Authorized user does not match user user in request")
    
    return token_user_id
    
def get_jwt_payload(token):
    try:
        jsonurl = urlopen(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json")
        jwks = json.loads(jsonurl.read())
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
        if rsa_key:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=['RS256'],
                audience=AUTH0_AUDIENCE,
                issuer=f"https://{AUTH0_DOMAIN}/"
            )
            return payload
        return None
    except URLError:
        raise AuthHeaderException("Unable to reach authentication domain")
    except json.JSONDecodeError:
        raise AuthHeaderException("Unable to decode content from authentication domain")
    except jwt.ExpiredSignatureError:
        raise AuthHeaderException("Token is expired")
    except jwt.JWTClaimsError:
        raise AuthHeaderException("Incorrect claims. Please, check the audience and issuer")
    except Exception:
        raise AuthHeaderException("Unable to parse authentication token")