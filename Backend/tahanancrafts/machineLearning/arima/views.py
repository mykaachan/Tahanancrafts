from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils import build_sales_series, fit_arima_series
from .models import ForecastResult
from .serializers import ForecastResultSerializer
import traceback

class ARIMAForecastAPIView(APIView):
    """
    POST /api/arima/forecast/
    body params:
      - name (optional)
      - product_id (optional)  -> if omitted, forecasts overall sales
      - by: "monthly" (default) or "daily"
      - order: [p,d,q] optional (defaults to [1,1,1])
      - steps: int (forecast horizon, default 12)
      - save: bool (default true) whether to persist to ForecastResult table
    """
    def post(self, request):
        payload = request.data
        try:
            product_id = payload.get("product_id")
            by = payload.get("by", "monthly")
            order = tuple(payload.get("order", (1,1,1)))
            steps = int(payload.get("steps", 12))
            save_result = payload.get("save", True)

            series = build_sales_series(product_id=product_id, by=by)
            if series.empty:
                return Response({"error": "No sales data found for requested scope."}, status=status.HTTP_400_BAD_REQUEST)

            result = fit_arima_series(series, order=order, steps=steps)

            # save to DB
            fr = None
            if save_result:
                fr = ForecastResult.objects.create(
                    name=payload.get("name", f"arima_{product_id or 'overall'}"),
                    params={"product_id": product_id, "by": by, "order": order, "steps": steps},
                    series={"dates": [str(d.date()) for d in series.index], "values": series.tolist()},
                    forecast=result["forecast"],
                    conf_int=result["conf_int"],
                    aicc=result.get("aicc"),
                    notes="created via API"
                )
                serializer = ForecastResultSerializer(fr)
                data = serializer.data
            else:
                data = {
                    "name": payload.get("name", ""),
                    "params": {"product_id": product_id, "by": by, "order": order, "steps": steps},
                    "series": {"dates": [str(d.date()) for d in series.index], "values": series.tolist()},
                }

            data["forecast"] = result["forecast"]
            data["conf_int"] = result["conf_int"]
            data["model_summary"] = result.get("model_summary")
            data["aicc"] = result.get("aicc")

            return Response(data, status=status.HTTP_201_CREATED if fr else status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ARIMAForecastGetAPIView(APIView):
    """
    GET /api/arima/forecast/<int:pk>/
    returns saved ForecastResult
    """
    def get(self, request, pk):
        try:
            fr = ForecastResult.objects.get(pk=pk)
            serializer = ForecastResultSerializer(fr)
            return Response(serializer.data)
        except ForecastResult.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
