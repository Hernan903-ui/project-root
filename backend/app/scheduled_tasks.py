# app/scheduled_tasks.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from sqlalchemy.orm import Session
import datetime
import logging
from .database import SessionLocal
from .services.notifications import check_low_stock_levels
from .services.reports import generate_sales_report, export_report_to_json
from .config import settings

logger = logging.getLogger(__name__)

# Configurar scheduler
jobstores = {
    'default': SQLAlchemyJobStore(url=str(settings.DATABASE_URL))
}
scheduler = AsyncIOScheduler(jobstores=jobstores)

async def daily_sales_report():
    """Generar reporte diario de ventas y guardarlo"""
    logger.info("Generating daily sales report")
    
    db = SessionLocal()
    try:
        today = datetime.date.today()
        yesterday = today - datetime.timedelta(days=1)
        
        # Generar reporte
        report_data = generate_sales_report(db, yesterday, today, "day")
        
        # Exportar a JSON
        filename = f"auto_sales_report_{yesterday}_{today}"
        filepath = export_report_to_json(report_data, filename)
        
        logger.info(f"Daily sales report saved to {filepath}")
    except Exception as e:
        logger.error(f"Error generating daily report: {str(e)}")
    finally:
        db.close()

async def check_inventory_levels():
    """Verificar niveles de inventario y generar alertas"""
    logger.info("Checking inventory levels")
    
    db = SessionLocal()
    try:
        low_stock_items = await check_low_stock_levels(db)
        if low_stock_items:
            logger.warning(f"Found {len(low_stock_items)} products with low stock")
    except Exception as e:
        logger.error(f"Error checking inventory levels: {str(e)}")
    finally:
        db.close()

def start_scheduler():
    """Iniciar el scheduler con las tareas programadas"""
    # Reportes diarios a las 00:05 am
    scheduler.add_job(daily_sales_report, 'cron', hour=0, minute=5)
    
    # Verificar inventario cada 4 horas
    scheduler.add_job(check_inventory_levels, 'interval', hours=4)
    
    scheduler.start()
    logger.info("Scheduler started with background tasks")