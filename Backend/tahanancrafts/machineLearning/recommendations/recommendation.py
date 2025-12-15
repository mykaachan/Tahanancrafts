from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from products.models import Product, UserActivity
from random import shuffle
from collections import Counter
from users.models import CustomUser as Users

def compute_similarity_matrix():
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
    Return list of (Product, similarity_score)
    """
    if product_id not in product_ids:
        return []

    idx = product_ids.index(product_id)
    sim_scores = list(enumerate(cosine_sim[idx]))

    # sort by similarity
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # skip the item itself
    sim_scores = sim_scores[1 : top_n + 1]

    # return BOTH product + score
    recommended = [(products[i], float(score)) for i, score in sim_scores]

    return recommended

def get_personalized_recommendations(user_id, products, product_ids, cosine_sim, top_n=8):

    # User name
    try:
        user_obj = Users.objects.get(id=user_id)
        user_name = f"{user_obj.first_name} {user_obj.last_name}"
    except:
        user_name = f"User {user_id}"

    # User interactions
    interacted = list(
        UserActivity.objects.filter(
            user_id=user_id, action__in=["View", "Added to cart"]
        ).values_list("product_id", flat=True)
    )

    if not interacted:
        shuffled = products[:]
        shuffle(shuffled)
        return user_name, [(p, 0.0, 0) for p in shuffled[:top_n]]

    counter = Counter(interacted)
    scored = []   # (product, similarity, weight)

    for pid, weight in counter.items():
        recs = get_recommendations(pid, products, product_ids, cosine_sim, top_n)
        for product, sim_score in recs:
            scored.append((product, sim_score, weight))

    # Sort by similarity then weight
    scored.sort(key=lambda x: (x[1], x[2]), reverse=True)

    # Remove duplicates
    seen = set()
    final = []
    for p, sim, weight in scored:
        if p.id not in seen:
            final.append((p, sim, weight))
            seen.add(p.id)

    # Fill if not enough
    if len(final) < top_n:
        remaining = [p for p in products if p.id not in seen]
        shuffle(remaining)
        for p in remaining[: top_n - len(final)]:
            final.append((p, 0.0, 0))

    return user_name, final[:top_n]


    