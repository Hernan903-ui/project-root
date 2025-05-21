# app/schemas/reports.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

class SalesReport(BaseModel):
    date: str
    total: float

class ProductSales(BaseModel):
    id: int
    name: str
    sales: int
    revenue: float

class LowStockProduct(BaseModel):
    id: int
    name: str
    stock: int
    minStock: int

class DashboardMetrics(BaseModel):
    totalSales: float
    monthlyRevenue: float
    averageOrderValue: float
    customerCount: int