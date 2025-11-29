# products/delivery/webhook.py
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

        # TODO: Update Delivery model status
        # Example:
        # from products.models import Delivery
        # delivery = Delivery.objects.get(lalamove_order_id=data["orderId"])
        # delivery.status = data["status"]
        # delivery.save()

        return JsonResponse({"message": "Webhook received"}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
