from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..models import LoginCredentials, SignupCredentials, AuthResponse
from .. import sql_models
from ..database import get_db
import uuid
from datetime import datetime, timezone
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    # In a real app, verify JWT properly. 
    # For now, we are using a simplified mock token approach where we'd need a Token table to verify.
    # To keep this simple as requested (using SQL), let's assume the token IS the user_id for this migration step 
    # OR we implement a Token table. Let's implementing a basic Token table is better but might be overkill.
    # Alternative: Use the User table to store a current token? No, that's bad.
    # Let's use a simple in-memory cache for tokens OR just trust the token for now if we want to be stateless (JWT).
    # Since we previously had a token->user map in memory, let's replicate that behavior using a new table or just 
    # simplifying to say the token is a dummy JWT. 
    
    # Actually, let's just query the user by ID directly if we used JWT.
    # But since we are migrating from a mock token system...
    # Let's add a `token` column to User for simplicity in this demo? No, that limits to 1 session.
    # Let's create a Token model? 
    # Detailed Plan: 
    # 1. We'll simply lookup the user by email for login/signup.
    # 2. Authorization is trickier without a real JWT library. 
    # Let's stick to the previous behavior: Token map. 
    # But we want to use the DB. 
    # Let's assume we use the Token map in memory for active sessions to avoid creating a new table just for this unless needed.
    # Wait, the user asked for Postgres/Sqlite. 
    
    # CORRECT APPROACH: 
    # Use a real JWT library `python-jose`? OR just simulate it.
    # Let's simulate: We'll put the "token" in a `tokens` table or just keep using the in-memory dictionary for tokens 
    # since that wasn't explicitly asked to be moved to SQL, but it makes sense.
    
    # Let's use a simple Token table in sql_models.
    pass 
    # Re-reading: simple migration. I will use a simple global dict for tokens to keep it simple, 
    # or I can query the user by ID if I put the ID in the token.
    # Let's keep existing token behavior (in-memory) for now to minimize friction, 
    # BUT query the User from DB.
    
    # However, `get_user_by_token` in `db.py` was used.
    # Let's just implement a simple look up.
    return None

# Temporary in-memory token store for migration simplicity
# Ideally use a Redis or DB table
token_store = {}

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    email = token_store.get(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(sql_models.User).filter(sql_models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/login", response_model=AuthResponse)
def login(credentials: LoginCredentials, db: Session = Depends(get_db)):
    user = db.query(sql_models.User).filter(sql_models.User.email == credentials.email).first()
    if not user or user.password != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = str(uuid.uuid4())
    token_store[token] = user.email
    
    return AuthResponse(
        user=user,
        token=token
    )

@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup(credentials: SignupCredentials, db: Session = Depends(get_db)):
    existing_user = db.query(sql_models.User).filter(sql_models.User.email == credentials.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="User already exists")
    
    new_user = sql_models.User(
        id=str(uuid.uuid4()),
        email=credentials.email,
        username=credentials.username,
        password=credentials.password, # Plaintext for now as per mock
        createdAt=datetime.now(timezone.utc)
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = str(uuid.uuid4())
    token_store[token] = new_user.email
    
    return AuthResponse(user=new_user, token=token)

@router.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if token in token_store:
        del token_store[token]
    return {"message": "Logged out successfully"}

from ..models import LoginCredentials, SignupCredentials, AuthResponse, User

# ...

@router.get("/me", response_model=User) # Note: AuthResponse includes token, but User model doesn't. 
# The OpenAPI spec says /me returns User.
# Let's fix the response model to User.
def get_me(user: sql_models.User = Depends(get_current_user)):
    return user
