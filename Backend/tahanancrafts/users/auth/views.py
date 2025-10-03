# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.core.cache import cache
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import CustomUser, Profile
from users.utils import normalize_phone_number, send_otp_email, send_otp_sms
from .serializers import (
    RequestOTPSerializer, VerifyOTPSerializer,
    LoginRequestSerializer, LoginVerifyOTPSerializer,
    ForgotPasswordSerializer, ForgotPasswordOtpVerifySerializer,
    ChangePasswordSerializer
)

import random
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

# -------------------------------
# JWT Login View (for React)
# -------------------------------
class JWTLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        contact = request.data.get("contact")
        password = request.data.get("password")

        if not contact or not password:
            return Response({"error": "Email/Phone and password required."}, status=status.HTTP_400_BAD_REQUEST)

        # Determine contact type
        if "@" in contact:
            user = CustomUser.objects.filter(email=contact).first()
        else:
            contact = normalize_phone_number(contact)
            user = CustomUser.objects.filter(phone=contact).first()

        if not user or not user.check_password(password):
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "username": user.username,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
            }
        }, status=status.HTTP_200_OK)


# -------------------------------
# Fetch Profile (Protected)
# -------------------------------
class ProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user
        profile = getattr(user, "profile", None)
        if profile:
            avatar_url = profile.avatar.url if profile.avatar else f"https://ui-avatars.com/api/?name={user.username[0].upper()}&background=random&color=fff"
            data = {
                "username": user.username,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "gender": profile.gender,
                "date_of_birth": profile.date_of_birth,
                "avatar": avatar_url
            }
        else:
            data = {
                "username": user.username,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "gender": None,
                "date_of_birth": None,
                "avatar": f"https://ui-avatars.com/api/?name={user.username[0].upper()}&background=random&color=fff"
            }
        return Response(data, status=status.HTTP_200_OK)


# Simple test to check if authentication-related endpoints are working
class TestAuthConnection(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "GET auth works!"})

    def post(self, request):
        return Response({"message": "POST auth works too!"})

# Sends an OTP to a contact (email or phone)
class UserRegistrationView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RequestOTPSerializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.validated_data['contact']
            name = serializer.validated_data['name']
            password = serializer.validated_data['password']

            # Determine contact type
            try:
                validate_email(contact)
                contact_type = 'email'
            except ValidationError:
                contact_type = 'phone'
                contact = normalize_phone_number(contact)

            otp = str(random.randint(100000, 999999))

            # Store registration data and OTP in cache (expires in 5 min)
            cache.set(f"reg_{contact}", {
                "name": name,
                "contact": contact,
                "password": password,
                "otp": otp,
                "contact_type": contact_type
            }, timeout=300)

            # TODO: Send OTP via email or SMS here
            if contact_type == 'email':
                send_otp_email(contact, otp)
            else:
                send_otp_sms(contact, otp)

            return Response({"message": "OTP sent successfully. Enter OTP to verify email / contact number."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Verifies if OTP entered is correct (for either email or phone)
class VerifyRegisterOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.validated_data['contact']

            # Normalize contact for cache lookup
            if '@' in contact:
                normalized_contact = contact
            else:
                normalized_contact = normalize_phone_number(contact)

            otp = serializer.validated_data['otp']

            reg_data = cache.get(f"reg_{normalized_contact}")
            if not reg_data or reg_data['otp'] != otp:
                return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

            # Create user
            if reg_data['contact_type'] == 'email':
                user = CustomUser.objects.create_user(
                    email=reg_data['contact'],
                    name=reg_data['name'],
                    password=reg_data['password']
                )
            else:
                user = CustomUser.objects.create_user(
                    phone=reg_data['contact'],
                    name=reg_data['name'],
                    password=reg_data['password']
                )

            cache.delete(f"reg_{normalized_contact}")
            return Response({"message": "Successfully registered."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Request OTP for login
class LoginRequestOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginRequestSerializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.validated_data['contact']
            password = serializer.validated_data['password']

            # Special case for admin login
            if contact == "admin":
                user = CustomUser.objects.filter(role="admin", name="admin").first()
                if user and user.check_password(password):
                    return Response({"message": "Successfully logged in as admin."}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Invalid admin credentials."}, status=status.HTTP_400_BAD_REQUEST)

            # Normalize contact
            if '@' in contact:
                normalized_contact = contact
                user = CustomUser.objects.filter(email=normalized_contact).first()
            else:
                normalized_contact = normalize_phone_number(contact)
                user = CustomUser.objects.filter(phone=normalized_contact).first()

            if not user or not user.check_password(password):
                return Response({"error": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

            otp = str(random.randint(100000, 999999))
            cache.set(f"login_{normalized_contact}", {"otp": otp, "user_id": user.id}, timeout=300)

            # Send OTP
            if '@' in contact:
                send_otp_email(normalized_contact, otp)
            else:
                send_otp_sms(normalized_contact, otp)

            return Response({"message": "OTP sent. Please verify to login."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Verify OTP for login
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

class LoginVerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginVerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.validated_data['contact']
            otp = serializer.validated_data['otp']

            # Normalize contact
            if '@' in contact:
                normalized_contact = contact
            else:
                normalized_contact = normalize_phone_number(contact)

            login_data = cache.get(f"login_{normalized_contact}")
            if not login_data or login_data['otp'] != otp:
                return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = CustomUser.objects.get(id=login_data['user_id'])
            except CustomUser.DoesNotExist:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            # Clear the OTP from cache
            cache.delete(f"login_{normalized_contact}")

            # Return user info along with message
            user_data = {
                "id": user.id,
                "username": user.username,
                "role": user.role,
            }

            return Response({
                "message": f"Successfully logged in as {user.role}.",
                "user": user_data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#this is for forgot password
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.validated_data['contact']

            # Normalize before caching
            if '@' not in contact:
                contact = normalize_phone_number(contact)

            otp = str(random.randint(100000, 999999))
            cache.set(f"forgot_{contact}", {"otp": otp}, timeout=300)

            if '@' in contact:
                send_otp_email(contact, otp)
            else:
                send_otp_sms(contact, otp)

            return Response({"message": "OTP sent. Please verify to reset password."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordOtpVerify(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = ForgotPasswordOtpVerifySerializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.validated_data['contact']

            # Normalize before checking cache
            if '@' not in contact:
                contact = normalize_phone_number(contact)

            otp = serializer.validated_data['otp']
            cached = cache.get(f"forgot_{contact}")

            if not cached or cached['otp'] != otp:
                return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

            cache.set(f"forgot_verified_{contact}", True, timeout=300)
            return Response({"message": "OTP verified. You may now reset password."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePassword(APIView):
    permission_classes = [AllowAny]
    """Step 2: Change password after OTP verification"""
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            contact = serializer.validated_data['contact']
            new_password = serializer.validated_data['newpass1']
            repeat_password = serializer.validated_data['newpass2']

            # ✅ Normalize contact before cache lookup & DB query
            if '@' not in contact:
                contact = normalize_phone_number(contact)

            # check if OTP was verified earlier
            verified = cache.get(f"forgot_verified_{contact}")
            if not verified:
                return Response({"error": "OTP not verified or expired."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                valid_password = validate_and_return_new_password(new_password, repeat_password)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            # Find user by normalized contact
            if '@' in contact:
                user = CustomUser.objects.filter(email=contact).first()
            else:
                user = CustomUser.objects.filter(phone=contact).first()

            if not user:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            user.set_password(valid_password)
            user.save()

            # cleanup cache
            cache.delete(f"forgot_{contact}")
            cache.delete(f"forgot_verified_{contact}")

            return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoogleLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("credential")
        if not token:
            return Response({"error": "No token provided"}, status=400)

        user = verify_google_token(token)
        if not user:
            return Response({"error": "Invalid Google token"}, status=400)

        # Optionally: create session / JWT
        return Response({"message": "Login successful", "email": user.email, "name": user.name})