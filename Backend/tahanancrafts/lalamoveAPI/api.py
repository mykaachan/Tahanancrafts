import requests
import os
import json

# ENV Vars (add them in Vercel dashboard → Settings → Environment Variables)
BACKEND_URL = os.environ["BACKEND_URL"]          # example: https://tahanancrafts.onrender.com
LALAMOVE_KEY = os.environ["LALAMOVE_KEY"]
LALAMOVE_SECRET = os.environ["LALAMOVE_SECRET"]
LALAMOVE_COUNTRY = "PH"  # Philippines

def normalize_phone(phone):
    phone = phone.strip()
    if phone.startswith("+63"):
        return phone
    if phone.startswith("0"):
        return "+63" + phone[1:]
    return phone

def create_lalamove_order(quotation_id, pickup_stop_id, drop_stop_id, name, phone):
    url = f"https://rest.lalamove.com/v3/orders"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {LALAMOVE_KEY}:{LALAMOVE_SECRET}"
    }

    payload = {
        "quotationId": quotation_id,
        "serviceType": "MOTORCYCLE",
        "language": "en_PH",
        "stops": [
            { "stopId": pickup_stop_id },
            { "stopId": drop_stop_id }
        ],
        "requesterContact": {
            "name": name,
            "phone": phone
        }
    }

    return requests.post(url, headers=headers, json=payload)


def handler(request):
    try:
        body = request.json()
        order_id = body.get("order_id")

        if not order_id:
            return {"status": 400, "body": {"error": "order_id required"}}

        # 1. Fetch order+delivery data from your main backend
        backend_url = f"{BACKEND_URL}/api/products/orders/get-order/{order_id}/"
        res = requests.get(backend_url)
        
        if res.status_code != 200:
            return {"status": 500, "body": {"error": "Failed to fetch order info"}}

        data = res.json()
        order = data["order"]
        delivery = data["delivery"]

        buyer_name = order["shipping_name"]
        buyer_phone = normalize_phone(order["shipping_phone"])

        # 2. Create Lalamove order
        ll = create_lalamove_order(
            delivery["quotation_id"],
            delivery["pickup_stop_id"],
            delivery["dropoff_stop_id"],
            buyer_name,
            buyer_phone
        )

        if ll.status_code != 201:
            return {"status": ll.status_code, "body": ll.json()}

        # success
        return {"status": 201, "body": ll.json()["data"]}

    except Exception as e:
        return {"status": 500, "body": {"error": str(e)}}
