from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from myapp.views import home

schema_view = get_schema_view(
    openapi.Info(
        title="Companion Rental API",
        default_version='v1',
        description="API Documentation for Companion Rental Platform",
        contact=openapi.Contact(email="support@companion.com"),
    ),
    public=True,
)

urlpatterns = [
    # Admin Panel
    path('admin/', admin.site.urls),

    # API Routes
    path('api/', include('myapp.urls')),

    # Home API Test Page
    path('', home, name='home'),

    # Swagger Docs
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0)),
]

# Media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
