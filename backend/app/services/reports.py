from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc, cast, Date
from datetime import datetime, timedelta, date
from typing import List, Dict, Any, Optional
import pandas as pd
import json
import os
import csv

from ..models.sale import Sale, SaleItem
from ..models.product import Product
from ..models.category import Category
from ..models.inventory import InventoryMovement
from ..models.customer import Customer

def generate_sales_report(
    db: Session,
    start_date: date,
    end_date: date,
    group_by: str = "day"
) -> List[Dict[str, Any]]:
    """
    Genera un reporte de ventas agrupado por día, semana o mes.
    
    Args:
        db: Sesión de base de datos
        start_date: Fecha de inicio
        end_date: Fecha de fin
        group_by: Tipo de agrupación ('day', 'week', 'month')
    
    Returns:
        Lista de resultados con la información de ventas agrupada
    """
    # Definir el formato de agrupación según el parámetro
    if group_by == "week":
        date_format = func.date_trunc('week', Sale.created_at)
    elif group_by == "month":
        date_format = func.date_trunc('month', Sale.created_at)
    else:  # Día por defecto
        date_format = func.date(Sale.created_at)
    
    # Construir la consulta base
    query = db.query(
        date_format.label('date'),
        func.count(Sale.id).label('total_sales'),
        func.sum(Sale.total_amount).label('revenue'),
        func.sum(Sale.tax_amount).label('taxes'),
        func.sum(Sale.discount_amount).label('discounts')
    ).filter(
        and_(
            Sale.created_at >= start_date,
            Sale.created_at <= end_date,
            Sale.payment_status != 'cancelled'
        )
    ).group_by(
        date_format
    ).order_by(
        date_format
    )
    
    # Ejecutar la consulta
    result = query.all()
    
    # Convertir a formato de lista de diccionarios
    report = []
    for row in result:
        report.append({
            "date": row.date.strftime('%Y-%m-%d') if hasattr(row.date, 'strftime') else str(row.date),
            "total_sales": row.total_sales,
            "revenue": float(row.revenue) if row.revenue else 0.0,
            "taxes": float(row.taxes) if row.taxes else 0.0,
            "discounts": float(row.discounts) if row.discounts else 0.0,
            "net_revenue": float(row.revenue - row.taxes) if row.revenue and row.taxes else 0.0
        })
    
    return report

def generate_product_sales_report(
    db: Session,
    start_date: date,
    end_date: date,
    category_id: Optional[int] = None,
    limit: int = 50
) -> List[Dict[str, Any]]:
    """
    Genera un reporte de ventas por producto.
    
    Args:
        db: Sesión de base de datos
        start_date: Fecha de inicio
        end_date: Fecha de fin
        category_id: ID de categoría para filtrar (opcional)
        limit: Número máximo de productos a incluir
    
    Returns:
        Lista de resultados con la información de ventas por producto
    """
    # Construir la consulta base
    query = db.query(
        Product.id,
        Product.name,
        Product.sku,
        Category.name.label('category_name'),
        func.sum(SaleItem.quantity).label('quantity_sold'),
        func.sum(SaleItem.total).label('total_revenue'),
        func.avg(SaleItem.unit_price).label('avg_price')
    ).join(
        SaleItem, SaleItem.product_id == Product.id
    ).join(
        Sale, and_(
            Sale.id == SaleItem.sale_id,
            Sale.created_at >= start_date,
            Sale.created_at <= end_date,
            Sale.payment_status != 'cancelled'
        )
    ).join(
        Category, Category.id == Product.category_id
    )
    
    # Aplicar filtro de categoría si se especifica
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    # Agrupar y ordenar
    query = query.group_by(
        Product.id,
        Category.name
    ).order_by(
        desc(func.sum(SaleItem.quantity))
    ).limit(limit)
    
    # Ejecutar la consulta
    result = query.all()
    
    # Convertir a formato de lista de diccionarios
    report = []
    for row in result:
        report.append({
            "product_id": row.id,
            "product_name": row.name,
            "sku": row.sku,
            "category": row.category_name,
            "quantity_sold": row.quantity_sold,
            "total_revenue": float(row.total_revenue) if row.total_revenue else 0.0,
            "average_price": float(row.avg_price) if row.avg_price else 0.0
        })
    
    return report

def generate_inventory_value_report(
    db: Session
) -> Dict[str, Any]:
    """
    Genera un reporte del valor actual del inventario.
    
    Args:
        db: Sesión de base de datos
    
    Returns:
        Diccionario con información del valor del inventario
    """
    # Consulta para obtener el valor total del inventario
    inventory_value_query = db.query(
        func.sum(Product.stock_quantity * Product.cost_price).label('total_cost_value'),
        func.sum(Product.stock_quantity * Product.price).label('total_retail_value'),
        func.count(Product.id).label('total_products')
    ).filter(
        Product.is_active == True
    )
    
    inventory_value = inventory_value_query.first()
    
    # Consulta para obtener el valor por categoría
    category_value_query = db.query(
        Category.id,
        Category.name,
        func.sum(Product.stock_quantity * Product.cost_price).label('cost_value'),
        func.sum(Product.stock_quantity * Product.price).label('retail_value'),
        func.count(Product.id).label('product_count')
    ).join(
        Product, and_(
            Product.category_id == Category.id,
            Product.is_active == True
        )
    ).group_by(
        Category.id
    ).order_by(
        desc(func.sum(Product.stock_quantity * Product.cost_price))
    )
    
    category_values = category_value_query.all()
    
    # Construir el reporte
    report = {
        "summary": {
            "total_cost_value": float(inventory_value.total_cost_value) if inventory_value.total_cost_value else 0.0,
            "total_retail_value": float(inventory_value.total_retail_value) if inventory_value.total_retail_value else 0.0,
            "potential_profit": float(inventory_value.total_retail_value - inventory_value.total_cost_value) 
                if (inventory_value.total_retail_value and inventory_value.total_cost_value) else 0.0,
            "total_products": inventory_value.total_products
        },
        "by_category": [
            {
                "category_id": cat.id,
                "category_name": cat.name,
                "cost_value": float(cat.cost_value) if cat.cost_value else 0.0,
                "retail_value": float(cat.retail_value) if cat.retail_value else 0.0,
                "product_count": cat.product_count
            }
            for cat in category_values
        ]
    }
    
    return report

def generate_customer_sales_report(
    db: Session,
    start_date: date,
    end_date: date,
    limit: int = 20
) -> List[Dict[str, Any]]:
    """
    Genera un reporte de ventas por cliente.
    
    Args:
        db: Sesión de base de datos
        start_date: Fecha de inicio
        end_date: Fecha de fin
        limit: Número máximo de clientes a incluir
    
    Returns:
        Lista de resultados con la información de ventas por cliente
    """
    # Consulta para obtener las ventas por cliente
    query = db.query(
        Customer.id,
        Customer.name,
        Customer.email,
        func.count(Sale.id).label('total_purchases'),
        func.sum(Sale.total_amount).label('total_spent'),
        func.avg(Sale.total_amount).label('avg_purchase_value'),
        func.min(Sale.created_at).label('first_purchase'),
        func.max(Sale.created_at).label('last_purchase')
    ).join(
        Sale, and_(
            Sale.customer_id == Customer.id,
            Sale.created_at >= start_date,
            Sale.created_at <= end_date,
            Sale.payment_status != 'cancelled'
        )
    ).group_by(
        Customer.id
    ).order_by(
        desc(func.sum(Sale.total_amount))
    ).limit(limit)
    
    # Ejecutar la consulta
    result = query.all()
    
    # Convertir a formato de lista de diccionarios
    report = []
    for row in result:
        report.append({
            "customer_id": row.id,
            "name": row.name,
            "email": row.email,
            "total_purchases": row.total_purchases,
            "total_spent": float(row.total_spent) if row.total_spent else 0.0,
            "average_purchase": float(row.avg_purchase_value) if row.avg_purchase_value else 0.0,
            "first_purchase": row.first_purchase.strftime('%Y-%m-%d') if row.first_purchase else None,
            "last_purchase": row.last_purchase.strftime('%Y-%m-%d') if row.last_purchase else None
        })
    
    return report

def export_report_to_json(report_data: Any, filename: str) -> str:
    """
    Exporta un reporte a un archivo JSON.
    
    Args:
        report_data: Datos del reporte
        filename: Nombre del archivo a crear
    
    Returns:
        Ruta al archivo creado
    """
    # Asegurar que el nombre del archivo termine en .json
    if not filename.endswith('.json'):
        filename += '.json'
    
    # Crear directorio reports si no existe
    os.makedirs('reports', exist_ok=True)
    
    # Ruta completa del archivo
    filepath = os.path.join('reports', filename)
    
    # Escribir los datos al archivo
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, ensure_ascii=False, indent=4)
    
    return filepath

def export_report_to_csv(report_data: List[Dict[str, Any]], filename: str) -> str:
    """
    Exporta un reporte a un archivo CSV.
    
    Args:
        report_data: Datos del reporte en formato lista de diccionarios
        filename: Nombre del archivo a crear
    
    Returns:
        Ruta al archivo creado
    """
    # Asegurar que el nombre del archivo termine en .csv
    if not filename.endswith('.csv'):
        filename += '.csv'
    
    # Crear directorio reports si no existe
    os.makedirs('reports', exist_ok=True)
    
    # Ruta completa del archivo
    filepath = os.path.join('reports', filename)
    
    # Si no hay datos, crear un archivo vacío con las cabeceras
    if not report_data:
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['No data available'])
        return filepath
    
    # Convertir a DataFrame para facilitar el manejo
    df = pd.DataFrame(report_data)
    
    # Guardar a CSV
    df.to_csv(filepath, index=False, encoding='utf-8')
    
    return filepath

def generate_inventory_movements_report(
    db: Session,
    start_date: date,
    end_date: date,
    product_id: Optional[int] = None,
    movement_type: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Genera un reporte de movimientos de inventario.
    
    Args:
        db: Sesión de base de datos
        start_date: Fecha de inicio
        end_date: Fecha de fin
        product_id: ID del producto para filtrar (opcional)
        movement_type: Tipo de movimiento para filtrar (opcional)
    
    Returns:
        Lista de resultados con la información de movimientos de inventario
    """
    # Construir la consulta base
    query = db.query(
        InventoryMovement.id,
        InventoryMovement.movement_type,
        InventoryMovement.quantity,
        InventoryMovement.notes,
        InventoryMovement.created_at,
        Product.id.label('product_id'),
        Product.name.label('product_name'),
        Product.sku
    ).join(
        Product, Product.id == InventoryMovement.product_id
    ).filter(
        and_(
            InventoryMovement.created_at >= start_date,
            InventoryMovement.created_at <= end_date
        )
    )
    
    # Aplicar filtros adicionales si se especifican
    if product_id:
        query = query.filter(Product.id == product_id)
    
    if movement_type:
        query = query.filter(InventoryMovement.movement_type == movement_type)
    
    # Ordenar por fecha
    query = query.order_by(desc(InventoryMovement.created_at))
    
    # Ejecutar la consulta
    result = query.all()
    
    # Convertir a formato de lista de diccionarios
    report = []
    for row in result:
        report.append({
            "movement_id": row.id,
            "movement_type": row.movement_type,
            "quantity": row.quantity,
            "product_id": row.product_id,
            "product_name": row.product_name,
            "sku": row.sku,
            "date": row.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            "notes": row.notes
        })
    
    return report

def generate_low_stock_report(
    db: Session,
    threshold_percentage: int = 20
) -> List[Dict[str, Any]]:
    """
    Genera un reporte de productos con bajo stock.
    
    Args:
        db: Sesión de base de datos
        threshold_percentage: Porcentaje límite para considerar bajo stock
        
    Returns:
        Lista de productos con stock bajo
    """
    # Calcular el valor del threshold basado en min_stock_level
    threshold_case = Product.min_stock_level * (1 + threshold_percentage / 100)
    
    # Consulta para productos con bajo stock
    query = db.query(
        Product.id,
        Product.name,
        Product.sku,
        Product.stock_quantity,
        Product.min_stock_level,
        Category.name.label('category_name')
    ).join(
        Category, Category.id == Product.category_id
    ).filter(
        and_(
            Product.is_active == True,
            Product.stock_quantity <= threshold_case
        )
    ).order_by(
        (Product.stock_quantity / Product.min_stock_level)
    )
    
    # Ejecutar la consulta
    result = query.all()
    
    # Convertir a formato de lista de diccionarios
    report = []
    for row in result:
        # Calcular porcentaje de stock
        min_stock = row.min_stock_level if row.min_stock_level > 0 else 1
        stock_percentage = (row.stock_quantity / min_stock) * 100
        
        report.append({
            "product_id": row.id,
            "product_name": row.name,
            "sku": row.sku,
            "category": row.category_name,
            "current_stock": row.stock_quantity,
            "min_stock_level": row.min_stock_level,
            "stock_percentage": round(stock_percentage, 2),
            "status": "Critical" if row.stock_quantity <= row.min_stock_level else "Low"
        })
    
    return report