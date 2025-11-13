# backend/tahanancrafts/products/recommender.py

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from products.models import Product, UserActivity
from collections import Counter
from random import shuffle


# =====================================================================
# 1) TF-IDF Similarity Between Products
# =====================================================================

def get_similar_products(product_id, top_n=8):
    """Return a list of product IDs similar to the given product."""
    
    products = Product.objects.all().prefetch_related("materials", "categories")
    if not products.exists():
        return []

    # Build text data for TF-IDF model
    data = []
    for p in products:
        materials = " ".join([m.name for m in p.materials.all()])
        categories = " ".join([c.name for c in p.categories.all()])
        combined_text = f"{p.name} {p.brandName} {p.description} {materials} {categories}"
        data.append(combined_text)

    # Vectorize using TF-IDF
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(data)
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # Product index mapping
    product_ids = list(products.values_list("id", flat=True))
    if product_id not in product_ids:
        return []

    idx = product_ids.index(product_id)
    sim_scores = list(enumerate(cosine_sim[idx]))

    # Sort by similarity
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1 : top_n + 1]  # skip itself

    similar_ids = []
    for idx, score in sim_scores:
        similar_ids.append(product_ids[idx])

    return similar_ids



# =====================================================================
# 2) Personalized Recommendations Per User
# =====================================================================

def get_personalized_recommendations(user_id, top_n=20):
    """
    Build personalized recommendations using:
    - user product interactions (views, add-to-cart)
    - TF-IDF similarity
    - frequency weighting
    Returns: list of product IDs
    """

    # Fetch user activity
    interactions = list(
        UserActivity.objects.filter(
            user_id=user_id,
            action__in=["View", "Added to cart"]
        ).values_list("product_id", flat=True)
    )

    # No interactions → fallback to latest/random products
    if not interactions:
        qs = Product.objects.all().order_by("-created_at")
        products_list = list(qs)
        shuffle(products_list)
        return [p.id for p in products_list[:top_n]]

    # Count frequency of interaction per product
    counter = Counter(interactions)

    weighted_recs = []

    # For every interacted product, get similar ones
    for pid, weight in counter.items():
        similar_ids = get_similar_products(pid, top_n=top_n)
        for sid in similar_ids:
            weighted_recs.append((sid, weight))

    # Sort by weight (interaction frequency)
    weighted_recs.sort(key=lambda x: x[1], reverse=True)

    # Remove duplicates (keep highest weighted first)
    unique = []
    seen_ids = set()

    for pid, w in weighted_recs:
        if pid not in seen_ids:
            seen_ids.add(pid)
            unique.append(pid)

    # Fill with random if needed
    if len(unique) < top_n:
        remaining_qs = Product.objects.exclude(id__in=unique)
        remaining = list(remaining_qs)
        shuffle(remaining)
        unique.extend([p.id for p in remaining])

    return unique[:top_n]



# =====================================================================
# 3) Public wrapper for scheduler to call
# =====================================================================

def get_recommendations_for_user(user_id, top_k=50):
    """
    Scheduler and API use this function.
    Returns product IDs only.
    """
    return get_personalized_recommendations(user_id, top_n=top_k)
