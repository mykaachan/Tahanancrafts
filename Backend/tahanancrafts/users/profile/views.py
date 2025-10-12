from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from users.models import CustomUser
from .serializers import ProfileSerializer, EditProfileSerializer
from users.utils import validate_and_return_new_password
from django.contrib.auth.hashers import check_password


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

        # Try to access user's profile
        profile = getattr(user, "profile", None)

        if profile is None:
            # If profile not yet created, fall back to initials based on name
            if user.name:
                parts = user.name.strip().split()
                if len(parts) >= 2:
                    initials = (parts[0][0] + parts[1][0]).upper()
                else:
                    initials = user.name[0].upper()
            else:
                initials = "U"

            profile_data = {
                "username": user.username,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "gender": None,
                "date_of_birth": None,
                "initials": initials,
                "avatar_url": f"https://ui-avatars.com/api/?name={initials}&background=random&color=fff",
            }
            return Response({"user": profile_data}, status=status.HTTP_200_OK)

        # ✅ Profile exists — use serializer for full data
        serializer = ProfileSerializer(profile, context={"request": request})
        data = serializer.data

        # Add initials fallback in case not generated yet
        if not data.get("initials"):
            if user.name:
                parts = user.name.strip().split()
                if len(parts) >= 2:
                    data["initials"] = (parts[0][0] + parts[1][0]).upper()
                else:
                    data["initials"] = user.name[0].upper()
            else:
                data["initials"] = "U"

        # If avatar is missing, use generated avatar from initials
        if not data.get("avatar"):
            data["avatar_url"] = f"https://ui-avatars.com/api/?name={data['initials']}&background=random&color=fff"

        return Response({"user": data}, status=status.HTTP_200_OK)


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
        data = request.data
        user_id = data.get("user_id")  # get user_id from frontend
        old_password = data.get("old_password")
        new_password = data.get("new_password")
        repeat_password = data.get("repeat_password")

        # Get the user by ID
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=404)

        # Verify old password
        if not check_password(old_password, user.password):
            return Response({"error": "Old password is incorrect."}, status=400)

        # Validate new password and repeat password
        try:
            valid_password = validate_and_return_new_password(new_password, repeat_password)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        # Update password
        user.set_password(valid_password)
        user.save()

        return Response({"success": "Password changed successfully."}, status=200)