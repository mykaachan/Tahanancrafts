#test_lalamove_shell.py
import time, json, hmac, hashlib, requests
from django.conf import settings

class FakeOrder:
    lat = "14.5533"
    lng = "121.0449"
    full_address = "Greenbelt, Makati City"

def _sign_body(secret, path, body_str, timestamp):
    raw = f"{timestamp}\r\nPOST\r\n{path}\r\n\r\n{body_str}"
    return hmac.new(secret.encode(), raw.encode(), hashlib.sha256).hexdigest()

# -------------------------
# QUOTATION (uses "data" wrapper)
# -------------------------
def lalamove_get_quotation(order):
    api_key = settings.LALAMOVE_API_KEY
    secret = settings.LALAMOVE_SECRET

    base_url = "https://rest.sandbox.lalamove.com"
    path = "/v3/quotations"
    url = base_url + path

    # Generate correct scheduleAt timestamp (UTC, now + 5 min)
    import datetime
    ts = (datetime.datetime.utcnow() + datetime.timedelta(minutes=5))
    schedule_at = ts.strftime("%Y-%m-%dT%H:%M:%S.000Z")

    timestamp = str(int(time.time() * 1000))

    payload = {
        "data": {
            "scheduleAt": schedule_at,
            "serviceType": "MOTORCYCLE",
            "specialRequests": [],
            "language": "en_PH",
            "isRouteOptimized": False,
            "stops": [
                {
                    "coordinates": {"lat": "14.5896", "lng": "120.9810"},
                    "address": "TahananCrafts Seller, Makati"
                },
                {
                    "coordinates": {"lat": str(order.lat), "lng": str(order.lng)},
                    "address": order.full_address
                }
            ]
        }
    }

    body_str = json.dumps(payload, separators=(",", ":"))
    raw = f"{timestamp}\r\nPOST\r\n{path}\r\n\r\n{body_str}"
    signature = hmac.new(secret.encode(), raw.encode(), hashlib.sha256).hexdigest()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"hmac {api_key}:{timestamp}:{signature}",
        "market": "PH"
    }

    print("=== QUOTATION BODY SENT ===")
    print(body_str)
    print("=== HEADERS ===")
    print(headers)

    resp = requests.post(url, headers=headers, data=body_str)

    print("=== RESPONSE ===", resp.status_code)
    try:
        print(resp.json())
    except:
        print(resp.text)
    return resp


# -------------------------
# CREATE ORDER (v3 orders)
# -------------------------
def lalamove_create_order(order):
    api_key = settings.LALAMOVE_API_KEY
    secret = settings.LALAMOVE_SECRET
    market = "PH"

    base_url = "https://rest.sandbox.lalamove.com"
    path = "/v3/orders"
    url = base_url + path

    timestamp = str(int(time.time() * 1000))

    # Order body uses more detailed stop format (location + addresses + stopContact)
    body = {
        "scheduleAt": "NOW",
        "serviceType": "MOTORCYCLE",
        "isPOD": False,
        "isFragile": False,
        "remarks": "Order from TahananCrafts (sandbox)",
        "item": {"quantity": 1, "weight": 1, "categories": ["FOOD"]},
        "stops": [
            {
                "location": {"lat": "14.5896", "lng": "120.9810"},
                "addresses": {"en_PH": {"displayString": "TahananCrafts Seller"}},
                "stopContact": {"name": "Seller", "phone": "+639123456789"},
                "isPayerAccount": True
            },
            {
                "location": {"lat": str(order.lat), "lng": str(order.lng)},
                "addresses": {"en_PH": {"displayString": order.full_address}},
                "stopContact": {"name": "Buyer", "phone": "+639000000000"}
            }
        ],
        "requesterContact": {
            "name": "TahananCrafts",
            "phone": "+639123456789",
            "companyName": "TahananCrafts"
        }
    }

    # For orders Lalamove does NOT require wrapping in "data" (their sample shows for quotations only).
    body_str = json.dumps(body, separators=(",", ":"))
    signature = _sign_body(secret, path, body_str, timestamp)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"hmac {api_key}:{timestamp}:{signature}",
        "market": market,
    }

    print("=== ORDER BODY SENT ===")
    print(body_str)
    print("=== HEADERS ===")
    print(headers)

    resp = requests.post(url, headers=headers, data=body_str)
    print("=== RESPONSE ===", resp.status_code)
    try:
        print(resp.json())
    except Exception:
        print(resp.text)
    return resp

def lalamove_create_order_with_quotation(q):
    api_key = settings.LALAMOVE_API_KEY
    secret = settings.LALAMOVE_SECRET

    base_url = "https://rest.sandbox.lalamove.com"
    path = "/v3/orders"
    url = base_url + path

    timestamp = str(int(time.time() * 1000))

    # extract quotation data
    qdata = q.json()["data"]
    qid = qdata["quotationId"]

    # extract stopIds from quotation
    sender_stop_id = qdata["stops"][0]["stopId"]
    recipient_stop_id = qdata["stops"][1]["stopId"]

    # build order payload
    body = {
        "data": {
            "quotationId": qid,
            "sender": {
                "stopId": sender_stop_id,
                "name": "TahananCrafts",
                "phone": "+639123456789"
            },
            "recipients": [
                {
                    "stopId": recipient_stop_id,
                    "name": "Buyer",
                    "phone": "+639000000000"
                }
            ]
        }
    }

    body_str = json.dumps(body, separators=(",", ":"))
    raw = f"{timestamp}\r\nPOST\r\n{path}\r\n\r\n{body_str}"
    signature = hmac.new(secret.encode(), raw.encode(), hashlib.sha256).hexdigest()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"hmac {api_key}:{timestamp}:{signature}",
        "market": "PH"
    }

    print("=== ORDER BODY SENT ===")
    print(body_str)
    print("=== HEADERS ===")
    print(headers)

    resp = requests.post(url, headers=headers, data=body_str)

    print("=== ORDER RESPONSE ===", resp.status_code)
    try:
        print(resp.json())
    except:
        print(resp.text)

    return resp
