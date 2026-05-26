from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.db import connection
from django.utils import timezone
import time


def health_check(request):
    """
    Liveness + readiness probe for load balancers and container orchestrators.
    Returns 200 if DB is reachable, 503 otherwise.
    """
    start = time.monotonic()
    db_ok = False
    db_error = None

    try:
        connection.ensure_connection()
        db_ok = True
    except Exception as e:
        db_error = str(e)

    latency_ms = round((time.monotonic() - start) * 1000, 2)

    payload = {
        'status': 'ok' if db_ok else 'degraded',
        'service': 'buyladies-api',
        'timestamp': timezone.now().isoformat(),
        'checks': {
            'database': {
                'status': 'ok' if db_ok else 'error',
                'latency_ms': latency_ms,
            },
        },
    }
    if db_error:
        payload['checks']['database']['error'] = db_error

    status_code = 200 if db_ok else 503
    return JsonResponse(payload, status=status_code)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('api/auth/', include('users.urls')),
    path('api/products/', include('products.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/wishlist/', include('wishlist.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('api/banners/', include('banners.urls')),
    path('api/coupons/', include('coupons.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
