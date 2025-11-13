from apscheduler.schedulers.background import BackgroundScheduler
from django_apscheduler.jobstores import DjangoJobStore, register_events
from django_apscheduler.models import DjangoJobExecution
from django.utils import timezone

from users.models import CustomUser
from products.models import UserRecommendations

from machineLearning.recommendations.recommendation import (
    compute_similarity_matrix,
    get_personalized_recommendations
)


def generate_all_recommendations():
    print("📌 Running scheduled recommendation job...")

    # 1. Build TF-IDF vectors + cosine similarity matrix (expensive)
    products, product_ids, cosine_sim = compute_similarity_matrix()

    # 2. Loop through all users
    for user in CustomUser.objects.all():
        # Generate personalized recommendations
        recs = get_personalized_recommendations(
            user.id,
            products,
            product_ids,
            cosine_sim,
            top_n=50
        )

        # Extract product IDs
        rec_ids = [p.id for p in recs]

        # Save or update the user's recommendations
        UserRecommendations.objects.update_or_create(
            user=user,
            defaults={"product_ids": rec_ids}
        )

    print("✅ Recommendations successfully updated for all users.")


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_jobstore(DjangoJobStore(), "default")

    # Run every hour (can change to daily)
    scheduler.add_job(
        generate_all_recommendations,
        trigger="interval",
        hours=1,
        id="recommendation_job",
        replace_existing=True,
    )

    register_events(scheduler)
    scheduler.start()

    print("⏰ Scheduler started: Recommendation engine running hourly.")
