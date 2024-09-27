from django.urls import path
from . import views

urlpatterns = [
    path('index/', views.index_view, name='admin_index'),
    path('obtener_empresas/', views.obtener_empresas, name='obtener_empresas'),
]
