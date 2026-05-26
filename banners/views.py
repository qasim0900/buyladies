from rest_framework import generics, permissions
from .models import Banner
from .serializers import BannerSerializer


class BannerListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = BannerSerializer

    def get_queryset(self):
        position = self.request.query_params.get('position', None)
        qs = Banner.objects.filter(is_active=True)
        if position:
            qs = qs.filter(position=position)
        return qs
