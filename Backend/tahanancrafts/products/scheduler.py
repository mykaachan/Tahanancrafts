# backend/tahanancrafts/products/scheduler.py
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from django_apscheduler.jobstores import DjangoJobStore, register_events

from users.models import CustomUser
from .models import UserRecommendations
from .recommender import compute_similarity_matrix, get_personalized_recommendation_ids

logger = logging.getLogger(__name__)

def generate_all_recommendations():
    logger.info("🔁 Scheduler: generating similarity matrix and user recommendations...")
    products, product_ids, cosine_sim = compute_similarity_matrix()
    if not products:
        logger.info("No products found; skipping recommendation generation.")
        return

    users = CustomUser.objects.all().only("id")
    logger.info(f"Generating recommendations for {users.count()} users")

    for user in users.iterator():
        try:
            rec_ids = get_personalized_recommendation_ids(user.id, products, product_ids, cosine_sim, top_n=50)
            UserRecommendations.objects.update_or_create(user_id=user.id, defaults={"product_ids": rec_ids})
        except Exception:
            logger.exception("Error generating recs for user %s", user.id)

    logger.info("✅ Completed generating recommendations for all users.")


def start_scheduler(interval_minutes=60):
    """
    Start APScheduler background scheduler. Default: run every `interval_minutes`.
    """
    if getattr(start_scheduler, "_started", False):
        return

    scheduler = BackgroundScheduler()
    scheduler.add_jobstore(DjangoJobStore(), "default")

    scheduler.add_job(
        generate_all_recommendations,
        trigger="interval",
        minutes=interval_minutes,
        id="generate_user_recommendations",
        replace_existing=True,
    )

    register_events(scheduler)
    scheduler.start()
    start_scheduler._started = True
    logger.info("⏰ APScheduler started: generate_all_recommendations every %s minutes", interval_minutes)
