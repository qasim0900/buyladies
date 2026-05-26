import uuid
from django.db import models


class Banner(models.Model):
    POSITION_CHOICES = [
        ('hero', 'Hero Slider'),
        ('promo', 'Promotional Banner'),
        ('category', 'Category Banner'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=400, blank=True)
    image = models.ImageField(upload_to='banners/')
    image_mobile = models.ImageField(upload_to='banners/mobile/', null=True, blank=True)
    cta_text = models.CharField(max_length=100, blank=True)
    cta_url = models.CharField(max_length=500, blank=True)
    position = models.CharField(max_length=20, choices=POSITION_CHOICES, default='hero', db_index=True)
    background_color = models.CharField(max_length=20, blank=True)
    text_color = models.CharField(max_length=20, blank=True, default='#ffffff')
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'banners'
        ordering = ['sort_order', 'id']
        indexes = [models.Index(fields=['position', 'is_active'])]

    def __str__(self):
        return f'{self.title} ({self.position})'
