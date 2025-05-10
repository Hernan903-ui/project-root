# tests/api/test_auth.py
import pytest
from fastapi.testclient import TestClient

def test_login_access_token(client):
    """Test para obtener un token de acceso."""
    response = client.post(
        "/api/auth/login",
        data={"username": "testuser", "password": "password"}
    )
    assert response.status_code == 200
    content = response.json()
    assert "access_token" in content
    assert content["token_type"] == "bearer"

def test_login_incorrect_password(client):
    """Test para intento de login con contraseña incorrecta."""
    response = client.post(
        "/api/auth/login",
        data={"username": "testuser", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]

def test_login_nonexistent_user(client):
    """Test para intento de login con usuario que no existe."""
    response = client.post(
        "/api/auth/login",
        data={"username": "nonexistentuser", "password": "password"}
    )
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]

def test_register_user(client):
    """Test para registrar un nuevo usuario."""
    response = client.post(
        "/api/auth/register",
        json={
            "username": "newuser",
            "email": "newuser@example.com",
            "full_name": "New User",
            "password": "newpassword"
        }
    )
    assert response.status_code == 200
    content = response.json()
    assert content["username"] == "newuser"
    assert content["email"] == "newuser@example.com"
    assert content["full_name"] == "New User"
    assert "id" in content
    
    # Intentar registrar el mismo usuario de nuevo debe fallar
    response = client.post(
        "/api/auth/register",
        json={
            "username": "newuser",
            "email": "another@example.com",
            "full_name": "Another User",
            "password": "anotherpassword"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]