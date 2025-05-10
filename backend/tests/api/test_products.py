# tests/api/test_products.py
import pytest
from fastapi.testclient import TestClient

def _get_auth_header(client):
    """Helper para obtener el header de autenticación."""
    response = client.post(
        "/api/auth/login",
        data={"username": "admin", "password": "admin"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_read_products(client):
    """Test para obtener la lista de productos."""
    headers = _get_auth_header(client)
    response = client.get("/api/products/", headers=headers)
    assert response.status_code == 200
    content = response.json()
    assert len(content) >= 3  # Debe haber al menos 3 productos que creamos en conftest.py
    
    # Verificar que los productos incluyen la relación con categoría
    assert "category" in content[0]
    assert content[0]["category"]["name"] is not None

def test_create_product(client):
    """Test para crear un nuevo producto."""
    headers = _get_auth_header(client)
    
    # Crear un nuevo producto
    new_product = {
        "name": "New Test Product",
        "description": "A product for testing",
        "sku": "TEST-001",
        "barcode": "9876543210",
        "price": 29.99,
        "cost_price": 15.00,
        "category_id": 1,
        "stock_quantity": 10,
        "min_stock_level": 2
    }
    
    response = client.post(
        "/api/products/",
        json=new_product,
        headers=headers
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == "New Test Product"
    assert content["sku"] == "TEST-001"
    
    # Intentar crear un producto con el mismo SKU debe fallar
    response = client.post(
        "/api/products/",
        json={**new_product, "name": "Another Product"},
        headers=headers
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_get_product(client):
    """Test para obtener un producto específico."""
    headers = _get_auth_header(client)
    
    # Obtener el producto con ID 1
    response = client.get("/api/products/1", headers=headers)
    assert response.status_code == 200
    content = response.json()
    assert content["id"] == 1
    assert "category" in content

def test_update_product(client):
    """Test para actualizar un producto."""
    headers = _get_auth_header(client)
    
    # Actualizar el producto con ID 1
    update_data = {
        "name": "Updated Product Name",
        "price": 39.99
    }
    
    response = client.put(
        "/api/products/1",
        json=update_data,
        headers=headers
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == "Updated Product Name"
    assert content["price"] == 39.99
    
    # Verificar que el resto de los datos no han cambiado
    assert content["sku"] == "PHONE-001"  # Valor que definimos en conftest.py