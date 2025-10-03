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
        if request is not None:
            return request.build_absolute_uri(avatar)
        return avatar
