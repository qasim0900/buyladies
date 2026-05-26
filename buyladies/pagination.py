from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsPagination(PageNumberPagination):
    """
    Consistent pagination envelope used across all list endpoints.
    Response shape:
    {
        "count": 120,
        "total_pages": 6,
        "current_page": 1,
        "page_size": 20,
        "next": "http://.../api/products/?page=2",
        "previous": null,
        "results": [...]
    }
    """

    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'page_size': self.get_page_size(self.request),
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
        })

    def get_paginated_response_schema(self, schema):
        return {
            'type': 'object',
            'properties': {
                'count': {'type': 'integer'},
                'total_pages': {'type': 'integer'},
                'current_page': {'type': 'integer'},
                'page_size': {'type': 'integer'},
                'next': {'type': 'string', 'nullable': True},
                'previous': {'type': 'string', 'nullable': True},
                'results': schema,
            },
        }


class LargeResultsPagination(PageNumberPagination):
    """For admin/export endpoints that may return more rows."""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 500
