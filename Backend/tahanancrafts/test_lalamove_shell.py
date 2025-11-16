import time, json, hmac, hashlib, requests
from django.conf import settings

# Fake order for testing
class FakeOrder:
    lat = "14.5533"
    lng = "121.0449"
    full_address = "Greenbelt, Makati City"

fake_order = FakeOrder()

def quotation_test(order):
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
        "isPOD": False,
        "isFragile": False,
        "item": {
            "quantity": 1,
            "weight": 1,
            "categories": ["FOOD"]
        },
        "stops": [
            {
                "location": {"lat": "14.5896", "lng": "120.9810"},
                "addresses": {"en_PH": {"displayString": "TahananCrafts Seller"}},
                "stopContact": {"name": "Seller", "phone": "+639123456789"},
                "isPayerAccount": True   # REQUIRED FOR FIRST STOP IN SANDBOX
            },
            {
                "location": {"lat": order.lat, "lng": order.lng},
                "addresses": {"en_PH": {"displayString": order.full_address}},
                "stopContact": {"name": "Buyer", "phone": "+639000000000"}
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

    print("\n=== QUOTATION RESPONSE ===")
    print(response.status_code)
    print(response.json())

quotation_test(fake_order)
