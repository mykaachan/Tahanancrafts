# backend/tahanancrafts/products/apps.py
from django.apps import AppConfig
from django.core.checks import register, Tags

class ProductsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "products"

    def ready(self):
        @register(Tags.models)
        def start_scheduler_check(app_configs, **kwargs):
            try:
                from .scheduler import start_scheduler
                # start with 60 minutes interval by default
                start_scheduler(interval_minutes=60)
            except Exception:
                import logging
                logging.getLogger(__name__).exception("Failed to start recommendations scheduler")
            return []
