# api/lalamove_webhook.py

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def lalamove_webhook(request):
    if request.method != "POST":
        return JsonResponse({"error": "invalid method"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
        print("🔥 LALAMOVE WEBHOOK RECEIVED:")
        print(json.dumps(data, indent=4))

        # data example:
        # {
        #   "orderId": "...",
        #   "status": "ASSIGNED",
        #   "driverId": "...",
        #   "driver": { ... }
        # }

        # TODO: Update your order status in DB here
        # Example:
        # order = Order.objects.get(lalamove_id=data["orderId"])
        # order.status = data["status"]
        # order.save()

        return JsonResponse({"message": "Webhook received"}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
