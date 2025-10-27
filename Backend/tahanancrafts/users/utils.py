import re
from django.core.mail import send_mail
from django.forms import ValidationError
from users.auth.validators import validate_password_strength
# users/utils.py
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from google.oauth2 import id_token
from django.conf import settings
from telesign.messaging import MessagingClient
from base64 import b64encode
import requests



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
        return '+63' + phone[1:]      # ✅ 09 → +639
    elif phone.startswith('639'):
        return '+63' + phone[2:]            # ✅ 63 → +63
    elif phone.startswith('+639'):
        return phone                  # ✅ already normalized
    else:
        return phone                  # fallback


### these are for Globe Lab
    ### Short Code 21665947 (Cross-telco: 225645947)
    ### APP ID 8xKaCoB59nuXkT8zEAi5KGuyRxKgCnpz
    ### APP SECRET 268b6c6a598edd95f6fb27a9b81c8864a0154522d4e815ffa5c22d1b0dc86d54


# OTP funtion - will generate otp and save to model and send to contact.
#send-email-OTP
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

def send_otp_email(email, code):
    subject = 'Your TahananCrafts Verification Code'
    from_email = f'TahananCrafts <{settings.DEFAULT_FROM_EMAIL}>'
    to_email = [email]

    print(f"📤 Preparing email to {email}")

    text_content = f'Your verification code is {code}. It expires in 5 minutes.'
    html_content = f"""
    <html><body>
        <h2>TahananCrafts Verification</h2>
        <p>Your verification code is:</p>
        <h1>{code}</h1>
        <p>Expires in 5 minutes.</p>
    </body></html>
    """

    # Use Django's EmailMultiAlternatives which now works with Resend backend
    msg = EmailMultiAlternatives(subject, text_content, from_email, to_email)
    msg.attach_alternative(html_content, "text/html")

    try:
        result = msg.send(fail_silently=False)
        print(f"✅ Email sent result: {result}")  # Resend returns 1 if successful
    except Exception as e:
        print(f"❌ Email send failed: {e}")


#send-contact-OTP
def send_otp_sms(contact, otp):
    
    #Sends OTP via SMS.
    
    # Simulate sending by printing
    print(f"OTP sent to {contact}: {otp}")

    # Sends OTP via TeleSign SMS API.
    """
    try:
        # Normalize number to +63 format
        contact = normalize_phone_number(contact)
        
        customer_id = settings.TELESIGN_CUSTOMER_ID
        api_key = settings.TELESIGN_API_KEY

        message = f"Your TahananCrafts OTP is {otp}. It expires in 5 minutes."
        message_type = "ARN"  # Alerts, Reminders, and Notifications

        messaging = MessagingClient(customer_id, api_key)
        response = messaging.message(contact, message, message_type)

        print("TeleSign Response:", response.body)
        return True
    except Exception as e:
        print("TeleSign Error:", str(e))
        return False
    

def send_otp_sms(contact, otp):
    
    Sends OTP via Kudosity / TransmitSMS API.
    
    try:
        # ✅ Normalize to +63 format
        contact = normalize_phone_number(contact)

        api_key = settings.KUDOSITY_API_KEY
        api_secret = settings.KUDOSITY_API_SECRET

        # ✅ Build Basic Auth header
        auth_str = f"{api_key}:{api_secret}"
        auth_header = {
            "Authorization": "Basic " + b64encode(auth_str.encode()).decode("utf-8")
        }

        # ✅ Prepare message
        message = f"Your TahananCrafts OTP is {otp}. It expires in 5 minutes."

        payload = {
            "to": contact,
            "message": message,
        }

        # ✅ Make request
        response = requests.post(
            "https://api.transmitsms.com/send-sms.json",
            headers=auth_header,
            data=payload,
            timeout=10,
        )

        # ✅ Handle response
        data = response.json()
        print("Kudosity Response:", data)

        if response.status_code == 200 and data.get("error", {}).get("code") == 0:
            print("✅ OTP sent successfully via Kudosity!")
            return True
        else:
            print("⚠️ Kudosity Error:", data.get("error"))
            return False

    except Exception as e:
        print("❌ Kudosity Exception:", str(e))
        return False
    """
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
