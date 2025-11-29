#lalamove.py
import time, hmac, hashlib, json, requests
from django.conf import settings

def lalamove_create_order(order):
    api_key = settings.LALAMOVE_API_KEY
    secret = settings.LALAMOVE_SECRET
    market = "PH_MNL"   # ✔ correct market for Manila

    # ✔ correct: DO NOT include /v3 in base URL
    base_url = "https://rest.sandbox.lalamove.com"
    path = "/v3/orders"  # ✔ correct Lalamove v3 endpoint

    url = base_url + path

    timestamp = str(int(time.time() * 1000))

    # ✔ JSON must be minified (no spaces)
    body = {
        "scheduleAt": "NOW",
        "serviceType": "MOTORCYCLE",
        "stops": [
            {
                "location": { "lat": "14.5896", "lng": "120.9810" },
                "addresses": {
                    "en_PH": { "displayString": "TahananCrafts Seller" }
                }
            },
            {
                "location": { "lat": str(order.lat), "lng": str(order.lng) },
                "addresses": {
                    "en_PH": { "displayString": order.full_address }
                }
            }
        ],
        "requesterContact": {
            "name": "TahananCrafts",
            "phone": "09123456789",
            "companyName": "TahananCrafts"

        }
    }

    body_str = json.dumps(body, separators=(",", ":"))

    # ✔ EXACT signature format
    raw = f"{timestamp}\r\nPOST\r\n{path}\r\n\r\n{body_str}"

    signature = hmac.new(
        secret.encode("utf-8"),
        raw.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"hmac {api_key}:{timestamp}:{signature}",
        "Market": market
    }
    print("URL:", url)
    print("HEADERS:", headers)
    print("BODY:", body_str)
    print("RAW SIG:", raw)

    response = requests.post(url, headers=headers, data=body_str)

    return response.json()

def lalamove_get_quotation(order):
    api_key = settings.LALAMOVE_API_KEY
    secret = settings.LALAMOVE_SECRET
    market = "PH_MNL"

    base_url = "https://rest.sandbox.lalamove.com"
    path = "/v3/quotations"
    url = base_url + path

    timestamp = str(int(time.time() * 1000))

    body = {
        "scheduleAt": "NOW",
        "serviceType": "MOTORCYCLE",
        "stops": [
            {
                "location": {"lat": "14.5896", "lng": "120.9810"},
                "addresses": {"en_PH": {"displayString": "TahananCrafts Seller"}}
            },
            {
                "location": {"lat": str(order.lat), "lng": str(order.lng)},
                "addresses": {"en_PH": {"displayString": order.full_address}}
            }
        ]
    }

    body_str = json.dumps(body, separators=(",", ":"))

    raw = f"{timestamp}\r\nPOST\r\n{path}\r\n\r\n{body_str}"

    signature = hmac.new(
        secret.encode("utf-8"),
        raw.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"hmac {api_key}:{timestamp}:{signature}",
        "Market": market,
    }

    response = requests.post(url, headers=headers, data=body_str)
    return response.json()