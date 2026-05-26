import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404

logger = logging.getLogger('buyladies.errors')


def custom_exception_handler(exc, context):
    """
    Wraps all DRF exceptions in a consistent envelope:
    {
        "error": true,
        "status_code": 400,
        "message": "Human-readable summary",
        "detail": { ... original DRF error ... }
    }
    Also catches Django-native errors not handled by DRF.
    """

    # Convert Django ValidationError to DRF-compatible
    if isinstance(exc, DjangoValidationError):
        from rest_framework.exceptions import ValidationError
        exc = ValidationError(detail=exc.message_dict if hasattr(exc, 'message_dict') else exc.messages)

    response = exception_handler(exc, context)

    if response is not None:
        # Log 5xx server errors
        if response.status_code >= 500:
            logger.error(
                'SERVER_ERROR status=%s view=%s exc=%s',
                response.status_code,
                context.get('view', 'unknown'),
                exc,
                exc_info=True,
            )

        response.data = {
            'error': True,
            'status_code': response.status_code,
            'message': _extract_message(response.data),
            'detail': response.data,
        }
    else:
        # Unhandled exception
        logger.critical(
            'UNHANDLED_EXCEPTION view=%s exc=%s',
            context.get('view', 'unknown'),
            exc,
            exc_info=True,
        )
        response = Response(
            {
                'error': True,
                'status_code': 500,
                'message': 'An internal server error occurred.',
                'detail': None,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response


def _extract_message(data):
    if isinstance(data, dict):
        if 'detail' in data:
            return str(data['detail'])
        first_val = next(iter(data.values()), None)
        if isinstance(first_val, list) and first_val:
            return str(first_val[0])
        return str(first_val) if first_val else 'Validation error'
    if isinstance(data, list) and data:
        return str(data[0])
    return str(data) if data else 'Error'
