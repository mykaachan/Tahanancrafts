from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from users.utils import normalize_phone_number 
import uuid
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver


class CustomUserManager(BaseUserManager):
    def create_user(self, email=None, phone=None, password=None, **extra_fields):
        if not email and not phone:
            raise ValueError("Users must have either an email or a phone number.")
        
        if phone:
            phone = normalize_phone_number(phone)
        if email:
            email = self.normalize_email(email)

        user = self.model(email=email, phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email=None, phone=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email=email, phone=phone, password=password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)  # Optional field
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    name = models.CharField(max_length=255)

    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('seller', 'Seller'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'  # Keep as 'email' if you want email login
    REQUIRED_FIELDS = ['']      # Leave empty or add only fields you want required for createsuperuser

    def __str__(self):
        return self.email or self.phone

class OTP(models.Model):
    contact = models.CharField(max_length=100)  # email or phone
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(default=timezone.now)
    is_verified = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(minutes=5)
    
class EmailOTP(models.Model):
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email} - {self.otp}"
    
class Profile(models.Model):
    GENDER_CHOICES = [
        ("M", "Male"),
        ("F", "Female"),
        ("O", "Other"),
    ]

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="profile")
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    def __str__(self):
        return self.user.username

    @property
    def avatar_or_default(self):
        """Return uploaded avatar if available, else a generated letter avatar."""
        if self.avatar:
            return self.avatar.url
        # Return placeholder avatar URL (first letter of username)
        first_letter = self.user.username[0].upper()
        return f"https://ui-avatars.com/api/?name={first_letter}&background=random&color=fff"

@receiver(post_save, sender=CustomUser)
def create_or_update_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    else:
        instance.profile.save()
