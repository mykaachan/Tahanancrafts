# users/auth/urls.py

from django.urls import path, include
from .views import TestAuthConnection
from .views import UserRegistrationView # Removed TestAuthConnection
from .views import VerifyRegisterOTPView
from .views import LoginRequestOTPView, LoginVerifyOTPView, ForgotPasswordView, ForgotPasswordOtpVerify, ChangePassword
from .views import GoogleLoginAPIView
from .views import JWTLoginView
from .views import CreateCustomUserView, GetUserIdView


urlpatterns = [
    path('test_auth/', TestAuthConnection.as_view(), name='auth-test'),
    path('user_register/', UserRegistrationView.as_view(), name='auth-register'),
    path('register_otp_verify/', VerifyRegisterOTPView.as_view()),
    path('login/',LoginRequestOTPView.as_view(), name='auth-login'),
    path('login_otp_verify/', LoginVerifyOTPView.as_view(), name='auth-login-verify-otp'),
    path('forgot_password/', ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('forgot_password_verify/', ForgotPasswordOtpVerify.as_view(), name='auth-forgot-password-verify-otp'),
    path('change_password/', ChangePassword.as_view(), name='auth-change-password'),
    path('google_callback/', GoogleLoginAPIView.as_view(), name='google-login'),
    path("jwt-login/", JWTLoginView.as_view(), name="jwt-login"),
    path("create-user/", CreateCustomUserView.as_view(), name="create-user"),   
    path('get_user_by_contact/', GetUserIdView.as_view(), name= "get_user_id"),
]


