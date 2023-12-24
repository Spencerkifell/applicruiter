from six.moves.urllib.request import urlopen
from six.moves.urllib.error import URLError
from global_utils import RouteException, config
from jose import jwt
import json

AUTH0_DOMAIN = config.auth0_config.get('domain')
AUTH0_AUDIENCE = config.auth0_config.get('audience')

def verify_user(headers, args):
    auth_header: str = headers.get('Authorization')
    if auth_header is None:
        raise RouteException("Authorization header is missing", 401)
    
    token = auth_header.replace('Bearer ', '')
    
    token_payload = get_jwt_payload(token)
    
    if token_payload is None:
        raise RouteException("Invalid or expired token", 401)
    
    token_user_id = token_payload.get('sub')
    request_user_id = args.get('userAuthId')
    
    if token_user_id != request_user_id:
        raise RouteException("Authorized user does not match user user in request", 401)
    
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
        raise RouteException("Unable to reach authentication domain", 500)
    except json.JSONDecodeError:
        raise RouteException("Unable to decode content from authentication domain", 502)
    except jwt.ExpiredSignatureError:
        raise RouteException("Token is expired", 401)
    except jwt.JWTClaimsError:
        raise RouteException("Incorrect claims. Please, check the audience and issuer", 401)
    except Exception:
        raise RouteException("Unable to parse authentication token", 400)