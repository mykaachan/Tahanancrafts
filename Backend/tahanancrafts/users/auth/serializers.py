# Import necessary modules and functions
from rest_framework import serializers  # For creating API serializers
from users.models import CustomUser  # Your custom user model
from users.auth.validators import validate_email_or_phone, validate_password_strength  # Custom validation functions
from users.utils import normalize_phone_number, validate_and_return_new_password  # Utility functions

# Serializer for user registration requests
# This serializer handles the input data for user registration, including contact information and password
class RequestOTPSerializer(serializers.Serializer):
    contact = serializers.CharField(validators=[validate_email_or_phone])
    name = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password_strength])

    def validate_contact(self, value):
        if '@' in value:
            if CustomUser.objects.filter(email=value).exists():
                raise serializers.ValidationError("Email already registered.")
        else:
            normalized_phone = normalize_phone_number(value)
            if CustomUser.objects.filter(phone=normalized_phone).exists():
                raise serializers.ValidationError("Phone already registered.")
            value = normalized_phone
        return value

class VerifyOTPSerializer(serializers.Serializer):
    contact = serializers.CharField()
    otp = serializers.CharField(max_length=6)

class LoginRequestSerializer(serializers.Serializer):
    contact = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate_contact(self, value):
        # ✅ Allow any string with "admin" and no '@'
        if "admin" in value.lower() and "@" not in value:
            return value
        # ✅ Otherwise must be email or phone
        if '@' in value:
            return value  # let email through
        else:
            # normalize phone (if you already have a helper for that)
            return normalize_phone_number(value)

class LoginVerifyOTPSerializer(serializers.Serializer):
    contact = serializers.CharField()
    otp = serializers.CharField(max_length=6)
    
#this if for forgot password
class ForgotPasswordSerializer(serializers.Serializer):
    contact = serializers.CharField(validators=[validate_email_or_phone])
    
    def validate_contact(self, value):
        if '@' in value:
            if not CustomUser.objects.filter(email=value).exists():
                raise serializers.ValidationError("Email not registered.")
        else:
            normalized_phone = normalize_phone_number(value)
            if not CustomUser.objects.filter(phone=normalized_phone).exists():
                raise serializers.ValidationError("Phone not registered.")
            value = normalized_phone
        return value
    
class ForgotPasswordOtpVerifySerializer(serializers.Serializer):
    contact = serializers.CharField()
    otp = serializers.CharField()


class ChangePasswordSerializer(serializers.Serializer):
    contact = serializers.CharField()
    newpass1 = serializers.CharField(write_only=True)
    newpass2 = serializers.CharField(write_only=True)


class CustomUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password_strength])
    role = serializers.ChoiceField(choices=[("admin", "Admin"), ("seller", "Seller")])

    class Meta:
        model = CustomUser
        fields = ["username", "name", "email", "phone", "role", "password"]

    def validate_phone(self, value):
        return normalize_phone_number(value)

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user