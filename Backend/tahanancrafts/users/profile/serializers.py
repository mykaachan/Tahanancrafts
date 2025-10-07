# users/serializers.py
from rest_framework import serializers
from users.models import CustomUser, Profile

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    name = serializers.CharField(source='user.name', read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['username', 'email', 'phone', 'name', 'gender', 'date_of_birth', 'avatar_url']

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        avatar = obj.avatar_or_default
        if request:
            return request.build_absolute_uri(avatar)
        return avatar
    
class EditProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    name = serializers.CharField(source='user.name', required=False)
    phone = serializers.CharField(source='user.phone', required=False)
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = ['username', 'email', 'name', 'phone', 'gender', 'date_of_birth', 'avatar']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        # Update CustomUser fields
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # Update Profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
