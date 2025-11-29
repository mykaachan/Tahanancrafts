import time, hmac, hashlib, json, requests
from django.conf import settings

BASE_URL = "https://rest.sandbox.lalamove.com"

def _sign(secret, path, body_str, timestamp):
    raw = f"{timestamp}\r\nPOST\r\n{path}\r\n\r\n{body_str}"
    return hmac.new(secret.encode(), raw.encode(), hashlib.sha256).hexdigest()


# ---------------------------------------------------
# 1) GET QUOTATION
# ---------------------------------------------------
def create_quotation(artisan, shipping_address):
    api_key = settings.LALAMOVE_API_KEY
    secret = settings.LALAMOVE_SECRET
    market = "PH"

    path = "/v3/quotations"
    url = BASE_URL + path
    timestamp = str(int(time.time() * 1000))

    # scheduleAt = now + 5 min (required)
    import datetime
    dt = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
    schedule_at = dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")

    payload = {
        "data": {
            "scheduleAt": schedule_at,
            "serviceType": "MOTORCYCLE",
            "language": "en_PH",
            "isRouteOptimized": False,
            "specialRequests": [],

            "stops": [
                {
                    "coordinates": {"lat": str(artisan.pickup_lat), "lng": str(artisan.pickup_lng)},
                    "address": artisan.pickup_address,
                },
                {
                    "coordinates": {"lat": str(shipping_address.lat), "lng": str(shipping_address.lng)},
                    "address": f"{shipping_address.address}, {shipping_address.barangay}, {shipping_address.city}"
                }
            ]
        }
    }

    body_str = json.dumps(payload, separators=(",", ":"))
    signature = _sign(secret, path, body_str, timestamp)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"hmac {api_key}:{timestamp}:{signature}",
        "market": market,
    }

    return requests.post(url, headers=headers, data=body_str)


# ---------------------------------------------------
# 2) CREATE ORDER WITH STOP IDs
# ---------------------------------------------------
def create_order_from_quotation(delivery):
    api_key = settings.LALAMOVE_API_KEY
    secret = settings.LALAMOVE_SECRET
    market = "PH"

    path = "/v3/orders"
    url = BASE_URL + path
    timestamp = str(int(time.time() * 1000))

    body = {
        "data": {
            "quotationId": delivery.quotation_id,

            "sender": {
                "stopId": delivery.pickup_stop_id,
                "name": "TahananCrafts",
                "phone": "+639123456789",
            },

            "recipients": [
                {
                    "stopId": delivery.dropoff_stop_id,
                    "name": delivery.order.shipping_address.full_name,
                    "phone": delivery.order.shipping_address.phone,
                }
            ],
        }
    }

    body_str = json.dumps(body, separators=(",", ":"))
    signature = _sign(secret, path, body_str, timestamp)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"hmac {api_key}:{timestamp}:{signature}",
        "market": market,
    }

    return requests.post(url, headers=headers, data=body_str)
