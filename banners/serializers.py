from rest_framework import serializers
from .models import Banner


class BannerSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    image_mobile_url = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = [
            'id', 'title', 'subtitle', 'image_url', 'image_mobile_url',
            'cta_text', 'cta_url', 'position', 'background_color', 'text_color', 'sort_order',
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_image_mobile_url(self, obj):
        request = self.context.get('request')
        if obj.image_mobile and request:
            return request.build_absolute_uri(obj.image_mobile.url)
        return None
