from django.apps import AppConfig

class ProductsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "products"

    def ready(self):
        from .scheduler import start_scheduler
        try:
            start_scheduler()
        except Exception as e:
            print("Scheduler failed to start:", e)
