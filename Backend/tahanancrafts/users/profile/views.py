# users/profile/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

class TestAuthConnection(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "GET prof works!"})

    def post(self, request):
        return Response({"message": "POST prof works too!"})