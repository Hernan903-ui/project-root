# app/services/notifications.py
import logging
from typing import List, Dict
from sqlalchemy.orm import Session
from ..models.product import Product
from ..models.user import User
from ..config import settings

logger = logging.getLogger(__name__)

async def check_low_stock_levels(db: Session) -> List[Dict]:
    """
    Verifica productos con niveles bajos de stock y genera notificaciones.
    """
    # Consultar productos con stock bajo
    low_stock_products = db.query(Product).filter(
        Product.stock_quantity <= Product.min_stock_level,
        Product.is_active == True
    ).all()
    
    if not low_stock_products:
        return []
    
    # Registrar alerta en el log
    for product in low_stock_products:
        logger.warning(
            f"Low stock alert: Product {product.name} (SKU: {product.sku}) - "
            f"Current stock: {product.stock_quantity}, Min level: {product.min_stock_level}"
        )
    
    # En un sistema real, aquí enviaríamos emails o notificaciones push
    # Por ahora simplemente devolvemos la lista de productos
    return [
        {
            "product_id": p.id,
            "name": p.name,
            "sku": p.sku,
            "current_stock": p.stock_quantity,
            "min_stock_level": p.min_stock_level,
            "status": "Critical" if p.stock_quantity <= p.min_stock_level else "Low"
        }
        for p in low_stock_products
    ]