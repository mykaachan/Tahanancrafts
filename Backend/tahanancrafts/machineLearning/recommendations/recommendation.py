from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from products.models import Product, UserActivity
from random import shuffle
from collections import Counter


def compute_similarity_matrix():
    """
    Build TF-IDF + cosine similarity matrix.
    This ONLY runs when called (e.g. in scheduler).
    """
    products = list(Product.objects.all())
    if not products:
        return [], []

    data = []
    for p in products:
        materials = " ".join([m.name for m in p.materials.all()])
        categories = " ".join([c.name for c in p.categories.all()])
        data.append(f"{p.name} {p.brandName} {p.description} {materials} {categories}")

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(data)
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    product_ids = [p.id for p in products]
    return products, product_ids, cosine_sim


def get_recommendations(product_id, products, product_ids, cosine_sim, top_n=8):
    """
    FAST version: requires precomputed cosine_sim.
    """
    if product_id not in product_ids:
        return []

    idx = product_ids.index(product_id)
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    sim_scores = sim_scores[1 : top_n + 1]
    recommended = [products[i] for i, _ in sim_scores]

    return recommended


def get_personalized_recommendations(user_id, products, product_ids, cosine_sim, top_n=8):
    """
    Personalized recommendations using precomputed matrix.
    """

    interacted = list(
        UserActivity.objects.filter(
            user_id=user_id, action__in=["View", "Added to cart"]
        ).values_list("product_id", flat=True)
    )

    if not interacted:
        shuffled = products[:]
        shuffle(shuffled)
        return shuffled[:top_n]

    counter = Counter(interacted)

    scored = []
    for pid, weight in counter.items():
        recs = get_recommendations(pid, products, product_ids, cosine_sim, top_n)
        for r in recs:
            scored.append((r, weight))

    # Sort by weight
    scored.sort(key=lambda x: x[1], reverse=True)

    # Remove duplicates
    seen = set()
    final = []
    for p, _ in scored:
        if p.id not in seen:
            final.append(p)
            seen.add(p.id)

    # Fill with random if needed
    if len(final) < top_n:
        remaining = [p for p in products if p.id not in seen]
        shuffle(remaining)
        final.extend(remaining[: top_n - len(final)])

    return final[:top_n]
