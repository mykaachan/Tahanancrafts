from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from products.models import Product, UserActivity
from collections import Counter
from random import shuffle


# ---------------------------------------------------------
# BUILD GLOBAL TF-IDF + COSINE MATRIX
# ---------------------------------------------------------
def compute_similarity_matrix():
    products = list(Product.objects.all().prefetch_related("materials", "categories"))

    if not products:
        return [], [], None

    # Build combined text for each product
    corpus = []
    for p in products:
        materials = " ".join([m.name for m in p.materials.all()])
        categories = " ".join([c.name for c in p.categories.all()])
        corpus.append(f"{p.name} {p.description} {materials} {categories}")

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(corpus)

    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    product_ids = [p.id for p in products]

    return products, product_ids, cosine_sim


# ---------------------------------------------------------
# GET SIMILAR PRODUCTS USING PRECOMPUTED MATRIX
# ---------------------------------------------------------
def get_recommendations_for_product(product_id, products, product_ids, cosine_sim, top_n=8):

    # ❗ FIXED: Correct conditions — no boolean numpy array checks
    if cosine_sim is None:
        return []

    if product_id not in product_ids:
        return []

    idx = product_ids.index(product_id)
    sim_scores = list(enumerate(cosine_sim[idx]))

    # Sort by similarity (descending)
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # Skip itself
    sim_scores = sim_scores[1 : top_n + 1]

    # Return products only
    return [products[i] for i, _ in sim_scores]


# ---------------------------------------------------------
# USER-PERSONALIZED RECOMMENDATIONS
# ---------------------------------------------------------
def get_personalized_recommendation_ids(user_id, products, product_ids, cosine_sim, top_n=20):

    # Get interacted product IDs
    interacted = list(
        UserActivity.objects.filter(
            user_id=user_id,
            action__in=['View', 'Added to cart']
        ).values_list("product_id", flat=True)
    )

    # If user has no interactions, fallback to random
    if not interacted:
        shuffled = products.copy()
        shuffle(shuffled)
        return [p.id for p in shuffled[:top_n]]

    # Weight interactions
    counts = Counter(interacted)
    weighted_recs = []

    for pid, weight in counts.items():
        recs = get_recommendations_for_product(
            pid, products, product_ids, cosine_sim, top_n=top_n
        )

        for r in recs:
            weighted_recs.append((r.id, weight))

    # Sort by weight
    weighted_recs.sort(key=lambda x: x[1], reverse=True)

    # Deduplicate while preserving order
    seen = set()
    final = []
    for pid, _ in weighted_recs:
        if pid not in seen:
            final.append(pid)
            seen.add(pid)

    # If not enough recommendations → fill with random
    if len(final) < top_n:
        remaining = [p.id for p in products if p.id not in seen]
        shuffle(remaining)
        final.extend(remaining)

    return final[:top_n]
