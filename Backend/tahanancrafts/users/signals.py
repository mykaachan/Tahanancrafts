from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser, Profile

@receiver(post_save, sender=CustomUser)
def create_or_update_profile(sender, instance, created, **kwargs):
    # Only create profile if the user is a customer
    if created and instance.role == 'customer':  
        Profile.objects.create(user=instance)
    elif instance.role == 'customer':
        # update profile if needed
        instance.profile.save()
