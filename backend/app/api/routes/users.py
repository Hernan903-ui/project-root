from typing import List, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Ajusta las rutas relativas según tu estructura
from app.database import get_db
from app.models.user import User as UserModel
# Eliminada referencia a UserRegister que ya no existe
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.utils.security import get_password_hash, get_current_user, get_current_active_superuser

router = APIRouter()

# Endpoint para gestión de perfil (accesible por cualquier usuario autenticado)
@router.get(
    "/profile",
    response_model=UserResponse,
    summary="Obtener el perfil del usuario actual"
)
async def get_current_user_profile(
    current_user: UserModel = Depends(get_current_user)
):
    """
    Obtiene el perfil del usuario autenticado actualmente.
    Requiere estar autenticado con un token JWT válido.
    """
    return current_user

@router.put(
    "/profile",
    response_model=UserResponse,
    summary="Actualizar el perfil del usuario actual"
)
async def update_current_user_profile(
    user_in: UserUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza el perfil del usuario autenticado actualmente.
    Requiere estar autenticado con un token JWT válido.
    """
    # Prohibir a usuarios normales modificar campos privilegiados
    if not current_user.is_admin:
        if user_in.is_admin is not None or user_in.is_active is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para modificar estado administrativo"
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
    response_model=UserResponse,
    summary="Actualizar imagen de perfil del usuario actual"
)
async def update_profile_image(
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

# Endpoints administrativos (requieren privilegios de administrador)
@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo usuario (admin)"
)
async def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)  # Solo administradores
):
    """
    Crea un nuevo usuario (solo administradores).
    """
    # Evitamos duplicados por email
    exists = db.query(UserModel).filter(UserModel.email == user_in.email).first()
    if exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El email ya está registrado"
        )
    
    # Evitamos duplicados por username
    if user_in.username:
        exists = db.query(UserModel).filter(UserModel.username == user_in.username).first()
        if exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El nombre de usuario ya está registrado"
            )
    
    # Hasheamos la contraseña
    hashed_pw = get_password_hash(user_in.password)
    
    # Creamos la instancia
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
    response_model=List[UserResponse],
    summary="Listar todos los usuarios (admin)"
)
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)  # Solo administradores
):
    """
    Lista todos los usuarios (solo administradores).
    """
    users = db.query(UserModel).offset(skip).limit(limit).all()
    return users

@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Obtener un usuario por ID (admin)"
)
async def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)  # Solo administradores
):
    """
    Obtiene los detalles de un usuario por su ID (solo administradores).
    """
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return db_user

@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Actualizar un usuario (admin)"
)
async def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)  # Solo administradores
):
    """
    Actualiza un usuario existente (solo administradores).
    """
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Comprobar si estamos cambiando un email a uno que ya existe
    if user_in.email and user_in.email != db_user.email:
        exists = db.query(UserModel).filter(UserModel.email == user_in.email).first()
        if exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El email ya está en uso por otro usuario"
            )
    
    # Comprobar si estamos cambiando un username a uno que ya existe
    if user_in.username and user_in.username != db_user.username:
        exists = db.query(UserModel).filter(UserModel.username == user_in.username).first()
        if exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El nombre de usuario ya está en uso"
            )
    
    # Si se permite cambiar contraseña:
    if user_in.password:
        setattr(db_user, "hashed_password", get_password_hash(user_in.password))
    
    # Actualiza otros campos
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
    summary="Eliminar un usuario (admin)"
)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)  # Solo administradores
):
    """
    Elimina un usuario (solo administradores).
    """
    # Proteger contra eliminación del propio usuario administrador
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puede eliminar su propia cuenta"
        )
    
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    db.delete(db_user)
    db.commit()
    return None

@router.patch(
    "/{user_id}/status",
    response_model=UserResponse,
    summary="Cambiar estado de activación (admin)"
)
async def set_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser)  # Solo administradores
):
    """
    Activa o desactiva un usuario (solo administradores).
    """
    # Proteger contra desactivación del propio usuario administrador
    if user_id == current_user.id and not is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puede desactivar su propia cuenta"
        )
    
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    db_user.is_active = is_active
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user