from django.apps import AppConfig
import os

class ProductsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "products"

    def ready(self):
        # prevent double-run
        if os.environ.get("RUN_MAIN") != "true":
            return

        print("🚀 Starting Delivery Simulator...")

        try:
            from .delivery.views import start_scheduler
            start_scheduler()
            print("✅ Delivery Scheduler Running Every 30 Seconds")
        except Exception as e:
            print("❌ Failed to start delivery simulator:", e)
