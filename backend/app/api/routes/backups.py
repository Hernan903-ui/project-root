# app/api/routes/backups.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import subprocess
import os
import datetime
from ...database import get_db
from ...api.routes.auth import get_current_active_user
from ...config import settings

router = APIRouter()

def create_database_backup(filename: str):
    """
    Crea un respaldo de la base de datos usando pg_dump.
    Esta función asume que tienes PostgreSQL instalado.
    """
    try:
        # Extraer datos de conexión desde DATABASE_URL
        db_url = str(settings.DATABASE_URL)
        db_parts = db_url.replace("postgresql://", "").split("/")
        auth_parts = db_parts[0].split("@")
        
        user_pass = auth_parts[0].split(":")
        username = user_pass[0]
        password = user_pass[1] if len(user_pass) > 1 else ""
        
        host_port = auth_parts[1].split(":")
        host = host_port[0]
        port = host_port[1] if len(host_port) > 1 else "5432"
        
        db_name = db_parts[1]
        
        # Crear directorio de backups si no existe
        backup_dir = "backups"
        os.makedirs(backup_dir, exist_ok=True)
        
        # Ejecutar pg_dump
        output_file = os.path.join(backup_dir, filename)
        env = os.environ.copy()
        env["PGPASSWORD"] = password
        
        subprocess.run([
            "pg_dump",
            "-h", host,
            "-p", port,
            "-U", username,
            "-F", "c",  # Custom format (compressed)
            "-b",       # Include large objects
            "-v",       # Verbose
            "-f", output_file,
            db_name
        ], env=env, check=True)
        
        return True
    except Exception as e:
        print(f"Error creating backup: {str(e)}")
        return False

@router.post("/database-backup")
async def create_backup(
    background_tasks: BackgroundTasks,
    current_user: Any = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Inicia un respaldo de la base de datos (solo administradores).
    """
    # Verificar que el usuario es admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Only administrators can create backups"
        )
    
    # Generar nombre de archivo con marca de tiempo
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"backup_{timestamp}.dump"
    
    # Ejecutar el backup en segundo plano
    background_tasks.add_task(create_database_backup, filename)
    
    return {
        "message": "Backup process started",
        "filename": filename,
        "status": "processing"
    }