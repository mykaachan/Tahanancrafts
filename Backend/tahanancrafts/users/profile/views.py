from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from users.models import CustomUser
from .serializers import ProfileSerializer

class ProfileView(APIView):
    permission_classes = [AllowAny]  # no JWT/auth needed

    def get(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id:
            return Response({"error": "User ID required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(id=user_id)
            profile = user.profile  # assuming you have a OneToOne profile
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
