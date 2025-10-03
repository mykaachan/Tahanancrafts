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
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Safely get or create profile
        profile = getattr(user, "profile", None)
        if profile is None:
            profile_data = {
                "username": user.name,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "gender": None,
                "date_of_birth": None,
                "avatar_url": f"https://ui-avatars.com/api/?name={user.name[0].upper()}&background=random&color=fff"
            }
            return Response({"user": profile_data}, status=status.HTTP_200_OK)

        # Serialize existing profile
        serializer = ProfileSerializer(profile, context={"request": request})
        return Response({"user": serializer.data}, status=status.HTTP_200_OK)
