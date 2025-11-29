# products/delivery/lalamove.py
import time, hmac, hashlib, json, requests
from django.conf import settings
import datetime

BASE_URL = "https://rest.sandbox.lalamove.com"


def _sign(secret, path, body_str, timestamp):
    raw = f"{timestamp}\r\nPOST\r\n{path}\r\n\r\n{body_str}"
    return hmac.new(secret.encode(), raw.encode(), hashlib.sha256).hexdigest()


# ---------------------------------------------------
# 1) GET QUOTATION
# ---------------------------------------------------
def create_quotation(pickup_lat, pickup_lng, pickup_address, drop_lat, drop_lng, drop_address):
    api_key = settings.LALAMOVE_API_KEY
    secret = settings.LALAMOVE_SECRET

    path = "/v3/quotations"
    url = BASE_URL + path
    timestamp = str(int(time.time() * 1000))

    schedule_at = (datetime.datetime.utcnow() + datetime.timedelta(minutes=5)) \
                    .strftime("%Y-%m-%dT%H:%M:%S.000Z")

    payload = {
        "data": {
            "scheduleAt": schedule_at,
            "serviceType": "MOTORCYCLE",
            "specialRequests": [],
            "language": "en_PH",
            "isRouteOptimized": False,
            "stops": [
                {
                    "coordinates": {
                        "lat": str(pickup_lat),
                        "lng": str(pickup_lng)
                    },
                    "address": pickup_address
                },
                {
                    "coordinates": {
                        "lat": str(drop_lat),
                        "lng": str(drop_lng)
                    },
                    "address": drop_address
                }
            ]
        }
    }

    body_str = json.dumps(payload, separators=(",", ":"))
    signature = _sign(secret, path, body_str, timestamp)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"hmac {api_key}:{timestamp}:{signature}",
        "market": "PH"
    }

    return requests.post(url, headers=headers, data=body_str)
