# pos/urls.py
from django.urls import path, include
from django.shortcuts import redirect
from django.contrib.auth import views as auth_views
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', lambda request: redirect('accounts:login')),  # Redirigir a 'accounts:login'
    path('accounts/', include(('accounts.urls', 'accounts'), namespace='accounts')),  # Incluye las URLs de accounts con namespace
    path("", include("admin_pos.urls")),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
