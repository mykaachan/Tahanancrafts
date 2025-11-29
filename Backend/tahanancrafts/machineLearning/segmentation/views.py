from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .segmentation import run_kmeans_customer_segmentation

class CustomerSegmentationAPIView(APIView):

    def post(self, request):
        try:
            k = int(request.data.get("k", 3))
            result = run_kmeans_customer_segmentation(k=k)

            if "error" in result:
                return Response(result, status=status.HTTP_400_BAD_REQUEST)

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
