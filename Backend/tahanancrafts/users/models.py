from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from users.utils import normalize_phone_number 
import uuid
from django.conf import settings
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
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
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

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email or self.phone or self.username


class OTP(models.Model):
    contact = models.CharField(max_length=100)
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
    initials = models.CharField(max_length=5, blank=True, null=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    def save(self, *args, **kwargs):
        # ✅ Generate initials from CustomUser.name
        if self.user and self.user.name:
            parts = self.user.name.strip().split()
            if len(parts) >= 2:
                self.initials = (parts[0][0] + parts[1][0]).upper()
            else:
                self.initials = parts[0][0].upper()
        super().save(*args, **kwargs)

    @property
    def avatar_or_default(self):
        # ✅ If user uploaded an avatar, return it
        if self.avatar:
            return self.avatar.url

        # ✅ Otherwise use initials or 'U'
        initials = self.initials or "U"
        return f"https://via.placeholder.com/150?text={initials}"

    def __str__(self):
        return self.user.name or self.user.username or "Unnamed User"


@receiver(post_save, sender=CustomUser)
def create_or_update_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    else:
        instance.profile.save()


class Artisan(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="artisans")
    name = models.CharField(max_length=100)
    short_description = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=150, blank=True)
    about_shop = models.TextField(blank=True)
    vision = models.TextField(blank=True)
    mission = models.TextField(blank=True)

    # Optional: a main photo reference (not required but useful)
    main_photo = models.ImageField(upload_to="artisan_photos/", blank=True, null=True)
    gcash_qr = models.ImageField(
    upload_to="artisan_qr_codes/",
    blank=True,
    null=True,
    help_text="Upload the GCash QR code for preorder downpayment"
)


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Store full address + coordinates
    pickup_address = models.CharField(max_length=255, blank=True)
    pickup_lat = models.FloatField(null=True, blank=True)
    pickup_lng = models.FloatField(null=True, blank=True)


    def __str__(self):
        return self.name
    
    
    

    
class ArtisanPhoto(models.Model):
    artisan = models.ForeignKey(Artisan, on_delete=models.CASCADE, related_name="photos")
    photo = models.ImageField(upload_to="artisan_photos/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for {self.artisan.name}"

class ShippingAddress(models.Model):
    user = models.ForeignKey("users.CustomUser", on_delete=models.CASCADE, related_name="addresses")
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)

    address = models.CharField(max_length=255)
    barangay = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    province = models.CharField(max_length=255)
    region = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    landmark = models.CharField(max_length=255, blank=True, null=True)


    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)

    is_default = models.BooleanField(default=False)
