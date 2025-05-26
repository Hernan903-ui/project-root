#app/api/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Any, Optional
from datetime import timedelta, datetime
from jose import JWTError, jwt
import logging

from ...database import get_db
from ...models.user import User
from ...schemas.token import Token
from ...schemas.user import UserCreate, UserResponse
from ...utils.security import (
    create_access_token, 
    verify_password, 
    get_password_hash,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# Configurar logging
logger = logging.getLogger("app.auth")

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError as e:
        logger.warning(f"JWT validation error: {str(e)}")
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        logger.warning(f"User with ID {user_id} not found in database")
        raise credentials_exception
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@router.post("/login", response_model=Token)
def login_access_token(
    response: Response,
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    logger.info(f"Login attempt for user: {form_data.username}")
    
    # Normalizar email (convertir a minúsculas)
    username = form_data.username.lower()
    
    # Buscar usuario por email o username
    user = db.query(User).filter(
        (User.email == username) | (User.username == username)
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Failed login attempt for: {username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(user.id, expires_delta=access_token_expires)
    
    # Establecer cookie para mayor seguridad (opcional)
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,  # Cambiar a True en producción con HTTPS
    )
    
    logger.info(f"Successful login for user: {user.username} (ID: {user.id})")
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    request: Request,
    db: Session = Depends(get_db), 
    user_in: UserCreate = None
) -> Any:
    """
    Register a new user account
    """
    # Log de inicio del proceso
    client_host = request.client.host
    logger.info(f"Registration attempt from IP: {client_host}")
    
    # Capturar el cuerpo de la solicitud para debugging
    try:
        body = await request.json()
        logger.info(f"Registration request data: {body}")
    except Exception:
        # Si no podemos leer el cuerpo como JSON, continuamos de todas formas
        logger.warning("Could not read request body as JSON")
    
    # Si user_in es None, algo salió mal con la validación de Pydantic
    if user_in is None:
        logger.error("Invalid user data format in registration request")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Datos de usuario inválidos. Verifique el formato de su solicitud."
        )
    
    # Normalizar email
    email = user_in.email.lower().strip()
    
    # Log de los datos recibidos (sin la contraseña)
    safe_log_data = {k: v for k, v in user_in.dict().items() if k != 'password'}
    logger.info(f"Processing registration for: {safe_log_data}")
    
    # Verificar si el email ya existe
    user = db.query(User).filter(User.email == email).first()
    if user:
        logger.warning(f"Registration failed: Email already exists: {email}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con este correo electrónico",
        )
    
    # Generar username a partir del email si no se proporciona
    username = getattr(user_in, 'username', None)
    if not username:
        # Generar username único basado en el email
        base_username = email.split('@')[0]
        username = base_username
        
        # Verificar si ya existe y añadir número si es necesario
        count = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{count}"
            count += 1
    else:
        # Verificar si el username ya existe
        if db.query(User).filter(User.username == username).first():
            logger.warning(f"Registration failed: Username already exists: {username}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe un usuario con este nombre de usuario",
            )
    
    # Validar formato de contraseña
    if len(user_in.password) < 8:
        logger.warning("Registration failed: Password too short")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña debe tener al menos 8 caracteres",
        )
    
    # Crear objeto de usuario
    db_user = User(
        username=username,
        email=email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        is_admin=False,
        is_active=True,  # Usuario activo por defecto
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # Guardar en la base de datos con manejo de errores
    db.add(db_user)
    try:
        db.commit()
        db.refresh(db_user)
        logger.info(f"User registered successfully: {username} (ID: {db_user.id})")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"IntegrityError during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se pudo crear el usuario. El nombre de usuario o correo ya existe.",
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error during user registration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocurrió un error inesperado al crear el usuario.",
        )
    
    # Retornar usuario creado sin incluir contraseña
    return db_user

@router.get("/health")
def auth_health_check():
    """
    Endpoint simple para verificar que la API de autenticación está funcionando
    """
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "auth"
    }