from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from users.models import CustomUser
from .serializers import ProfileSerializer, EditProfileSerializer

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

class EditProfileView(APIView):
    permission_classes = [AllowAny]  # or you could require authentication

    def patch(self, request):
        user_id = request.query_params.get("user_id") or request.data.get("user_id")
        if not user_id:
            return Response({"error": "User ID required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        profile = getattr(user, "profile", None)
        if profile is None:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = EditProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangeUserPasswordView(APIView):
    permission_classes = [AllowAny]  # change to IsAuthenticated once you use tokens

    def post(self, request):
        # Try to get user_id either from frontend or session
        user_id = request.query_params.get("user_id") or request.data.get("user_id")

        # If not using token/session, require user_id explicitly
        if not user_id:
            return Response({"error": "User ID required."}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the user
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get form fields
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        # Check missing fields
        if not all([old_password, new_password, confirm_password]):
            return Response(
                {"error": "All fields (old_password, new_password, confirm_password) are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate old password
        if not user.check_password(old_password):
            return Response({"error": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        # Match new passwords
        if new_password != confirm_password:
            return Response({"error": "New passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        # Prevent reuse
        if old_password == new_password:
            return Response({"error": "New password cannot be the same as the old password."}, status=status.HTTP_400_BAD_REQUEST)

        # Update password
        user.set_password(new_password)
        user.save()

        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)
