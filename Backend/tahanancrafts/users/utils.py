import re
from django.core.mail import send_mail
from django.forms import ValidationError
from users.auth.validators import validate_password_strength
# users/utils.py
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings

CLIENT_ID = "284499389727-dnqo999fk03kvkqug19bupignpgjahq6.apps.googleusercontent.com"

def verify_google_token(token):
    from users.models import CustomUser  # import inside function
    from google.oauth2 import id_token
    from google.auth.transport import requests
    try:
        # Verify token with Google
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
        
        # Get user info
        email = idinfo['email']
        name = idinfo.get('name', '')
        
        # Check if user exists
        user, created = CustomUser.objects.get_or_create(email=email, defaults={'name': name})
        return user
    except ValueError:
        return None



#Converting 09 to +639
def normalize_phone_number(phone):
    phone = re.sub(r'\D', '', phone)  # Remove non-digit characters
    if phone.startswith('09'):
        return '+63' + phone[1:]
    elif phone.startswith('63'):
        return '+' + phone
    elif phone.startswith('+63'):
        return phone
    else:
        return phone  # fallback

### these are for Globe Lab
    ### Short Code 21665947 (Cross-telco: 225645947)
    ### APP ID 8xKaCoB59nuXkT8zEAi5KGuyRxKgCnpz
    ### APP SECRET 268b6c6a598edd95f6fb27a9b81c8864a0154522d4e815ffa5c22d1b0dc86d54


# OTP funtion - will generate otp and save to model and send to contact.
#send-email-OTP
def send_otp_email(email,code):
    send_mail(
        subject='Your TahananCrafts Verification Code',
        message=f'Your verification code is {code}. It expires in 5 minutes.',
        from_email='no-reply@tahanancrafts.com',
        recipient_list=[email],
    )

#send-contact-OTP
def send_otp_sms(contact, otp):
    # Simulate sending by printing
    print(f"OTP sent to {contact}: {otp}")

#enter new password and repeat password with validation
def validate_and_return_new_password(newpass1, newpass2):
    """
    Validates password strength and checks if both passwords match.
    Returns the new password if valid, raises ValueError otherwise.
    """
    validate_password_strength(newpass1)
    if newpass1 != newpass2:
        raise ValueError("Passwords do not match.")
    return newpass1
