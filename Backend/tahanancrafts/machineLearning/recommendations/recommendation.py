from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from products.models import Product, UserActivity
from random import shuffle
from collections import Counter

def get_recommendations(product_id, top_n=8, show_scores=False):
    products = Product.objects.all()
    if not products.exists():
        return []

    # Build text data (combine name + description + materials + categories)
    data = []
    for p in products:
        materials = " ".join([m.name for m in p.materials.all()])
        categories = " ".join([c.name for c in p.categories.all()])
        data.append(f"{p.name} {p.brandName} {p.description} {materials} {categories}")

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(data)
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    product_indices = list(products.values_list("id", flat=True))
    if product_id not in product_indices:
        return []

    idx = product_indices.index(product_id)
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    # Skip the first (itself), take next top_n
    sim_scores = sim_scores[1 : top_n + 1]

    recommendations = []
    for i, score in sim_scores:
        product = products[i]
        recommendations.append((product, score))

    if show_scores:
        for product, score in recommendations:
            print(f"{product.name} → Similarity: {score:.4f}")

    # Return only product objects (for normal use)
    return [p for p, _ in recommendations]

from random import shuffle
from collections import Counter

def get_personalized_recommendations(user_id, top_n=8):
    # Get products user interacted with
    interacted_products = list(UserActivity.objects.filter(
        user_id=user_id, action__in=['View', 'Added to cart']
    ).values_list('product_id', flat=True))

    if not interacted_products:
        # Fallback: most recent products
        products_qs = Product.objects.all().order_by('-created_at')
        products_list = list(products_qs)
        shuffle(products_list)  # randomize order
        return products_list[:top_n]

    # Count interactions to weight recommendations
    counter = Counter(interacted_products)

    recommended = []
    for pid, weight in counter.items():
        recs = get_recommendations(pid, top_n=top_n)
        for r in recs:
            recommended.append((r, weight))  # attach weight

    # Sort by weight (interaction frequency)
    recommended.sort(key=lambda x: x[1], reverse=True)

    # Remove duplicates while keeping highest weight first
    seen = set()
    personalized = []
    for product, _ in recommended:
        if product.id not in seen:
            personalized.append(product)
            seen.add(product.id)

    # If not enough recommendations, fill with random
    if len(personalized) < top_n:
        remaining = Product.objects.exclude(id__in=[p.id for p in personalized])
        remaining_list = list(remaining)
        shuffle(remaining_list)
        personalized += remaining_list

    return personalized[:top_n]

