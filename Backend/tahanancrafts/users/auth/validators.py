from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import re

def validate_email_or_phone(value):
    if value == "admin":
        return
    try:
        validate_email(value)
        return value  # Valid email
    except ValidationError:
        # Philippine phone number format
        if re.match(r'^(09|\+639)\d{9}$', value):
            return value  # Valid phone
        raise ValidationError("Enter a valid email or phone number.")

def validate_password_strength(value):
    if len(value) < 8:
        raise ValidationError("Password must be at least 8 characters long.")
    if not re.search(r'[A-Z]', value):
        raise ValidationError("Password must contain at least one uppercase letter.")
    if not re.search(r'[a-z]', value):
        raise ValidationError("Password must contain at least one lowercase letter.")
    if not re.search(r'[0-9]', value):
        raise ValidationError("Password must contain at least one digit.")
    return value