import numpy as np
import pandas as pd
from django.utils import timezone
from datetime import timedelta
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from orders.models import Order, OrderItem  # adjust import path if needed
from users.models import CustomUser

def build_customer_dataset():
    """
    Extracts customer behavior features from your actual database.
    Returns a DataFrame: user_id, frequency, monetary, recency, avg_order_value, total_items
    """
    today = timezone.now()

    users = CustomUser.objects.filter(role="customer")

    records = []

    for user in users:
        orders = Order.objects.filter(user=user, status=Order.STATUS_DELIVERED)

        if not orders.exists():
            continue  # skip users with no delivered orders

        frequency = orders.count()
        monetary = float(sum(o.grand_total for o in orders))
        
        last_order = orders.order_by("-created_at").first()
        recency = (today - last_order.created_at).days

        avg_order_value = monetary / frequency if frequency > 0 else 0

        total_items = sum(item.quantity for o in orders for item in o.items.all())

        records.append({
            "user_id": user.id,
            "frequency": frequency,
            "monetary": monetary,
            "recency": recency,
            "avg_order_value": avg_order_value,
            "total_items": total_items,
        })

    return pd.DataFrame(records)


def run_kmeans_customer_segmentation(k=3):
    """
    Performs clustering and returns:
      - assignments {user_id, cluster_label}
      - centroids (raw)
    """
    df = build_customer_dataset()
    if df.empty:
        return {"error": "No customer data available"}

    feature_cols = ["frequency", "monetary", "recency", "avg_order_value", "total_items"]

    X = df[feature_cols].values

    # Normalize data
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Fit model
    model = KMeans(n_clusters=k, random_state=42)
    labels = model.fit_predict(X_scaled)

    df["cluster"] = labels

    assignments = df[["user_id", "cluster"]].to_dict(orient="records")
    centroids = scaler.inverse_transform(model.cluster_centers_).tolist()

    return {
        "assignments": assignments,
        "centroids": centroids,
        "features": feature_cols,
    }
