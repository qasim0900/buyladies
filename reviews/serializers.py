from rest_framework import serializers
from .models import Review
from users.serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'user_name', 'user_avatar', 'rating', 'title', 'body',
            'is_verified_purchase', 'helpful_count', 'created_at',
        ]

    def get_user_name(self, obj):
        return obj.user.get_full_name()

    def get_user_avatar(self, obj):
        request = self.context.get('request')
        if obj.user.avatar and request:
            return request.build_absolute_uri(obj.user.avatar.url)
        return None


class CreateReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'title', 'body']

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value
