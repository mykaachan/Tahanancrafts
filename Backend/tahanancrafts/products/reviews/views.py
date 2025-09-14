from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

class ReviewTestView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "GET review works!"})
    def post(self, request):
        return Response({"message": "POST review works too!"})
