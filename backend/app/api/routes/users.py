from typing import List, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Ajusta las rutas relativas según tu estructura
from app.database import get_db
from app.models.user import User as UserModel
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.utils.security import get_password_hash, get_current_user  # Añadido get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    # Si quieres proteger con OAuth2:
    # dependencies=[Depends(get_current_active_admin)]  
)


@router.get(
    "/profile",
    response_model=UserRead,
    summary="Obtener el perfil del usuario actual"
)
def get_current_user_profile(
    current_user: UserModel = Depends(get_current_user)
):
    """
    Obtiene el perfil del usuario autenticado actualmente.
    Requiere estar autenticado con un token JWT válido.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado"
        )
    return current_user


@router.put(
    "/profile",
    response_model=UserRead,
    summary="Actualizar el perfil del usuario actual"
)
def update_current_user_profile(
    user_in: UserUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza el perfil del usuario autenticado actualmente.
    Requiere estar autenticado con un token JWT válido.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado"
        )
    
    # Si se permite cambiar contraseña:
    if user_in.password:
        setattr(current_user, "hashed_password", get_password_hash(user_in.password))
    
    # Actualiza otros campos
    update_data = user_in.model_dump(exclude={"password"}, exclude_unset=True)
    for attr, value in update_data.items():
        setattr(current_user, attr, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post(
    "/profile/image",
    response_model=UserRead,
    summary="Actualizar imagen de perfil del usuario actual"
)
def update_profile_image(
    # Puedes usar Form para manejar formularios multipart
    # image: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza la imagen de perfil del usuario autenticado.
    Requiere estar autenticado con un token JWT válido.
    """
    # Aquí implementarías la lógica para guardar la imagen y actualizar el perfil
    # Por ahora, solo retornamos el usuario como ejemplo
    return current_user


@router.post(
    "/",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo usuario"
)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    # Evitamos duplicados por email
    exists = db.query(UserModel).filter(UserModel.email == user_in.email).first()
    if exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    # Hasheamos la contraseña
    hashed_pw = get_password_hash(user_in.password)
    
    # Creamos la instancia - corregido para usar model_dump() en lugar de dict()
    user_data = user_in.model_dump(exclude={"password"})
    db_user = UserModel(
        **user_data,
        hashed_password=hashed_pw
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get(
    "/",
    response_model=List[UserRead],
    summary="Listar todos los usuarios"
)
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    users = db.query(UserModel).offset(skip).limit(limit).all()
    return users


@router.get(
    "/{user_id}",
    response_model=UserRead,
    summary="Obtener un usuario por ID"
)
def read_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return db_user


@router.put(
    "/{user_id}",
    response_model=UserRead,
    summary="Actualizar un usuario"
)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db)
):
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    # Si te dejan cambiar contraseña:
    if user_in.password:
        setattr(db_user, "hashed_password", get_password_hash(user_in.password))
    
    # Actualiza otros campos - corregido para usar model_dump() en lugar de dict()
    update_data = user_in.model_dump(exclude={"password"}, exclude_unset=True)
    for attr, value in update_data.items():
        setattr(db_user, attr, value)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar un usuario"
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    db.delete(db_user)
    db.commit()
    return None  