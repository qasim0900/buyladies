import time
import uuid
import logging

logger = logging.getLogger('buyladies.requests')


class RequestTimingMiddleware:
    """
    Adds X-Request-ID and X-Response-Time headers to every response.
    Logs slow requests (>1s) as warnings for SRE visibility.
    """

    SLOW_REQUEST_THRESHOLD = 1.0

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = str(uuid.uuid4())[:8]
        request.request_id = request_id
        start = time.monotonic()

        response = self.get_response(request)

        duration = time.monotonic() - start
        response['X-Request-ID'] = request_id
        response['X-Response-Time'] = f'{duration:.3f}s'

        if duration > self.SLOW_REQUEST_THRESHOLD:
            logger.warning(
                'SLOW_REQUEST method=%s path=%s duration=%.3fs status=%s request_id=%s',
                request.method,
                request.path,
                duration,
                response.status_code,
                request_id,
            )
        else:
            logger.debug(
                'REQUEST method=%s path=%s duration=%.3fs status=%s',
                request.method,
                request.path,
                duration,
                response.status_code,
            )

        return response


class SecurityHeadersMiddleware:
    """
    Injects security headers on every response.
    Complements Django's SecurityMiddleware with additional headers.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        return response
