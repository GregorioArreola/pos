from django.urls import path
from . import views

urlpatterns = [
    path('index/', views.index_view, name='admin_index'),
    path('obtener_empresas/', views.obtener_empresas, name='obtener_empresas'),
    path('obtener_productos/', views.obtener_productos, name='obtener_productos'),
    path('empresa/<int:empresa_id>/detalle/', views.empresa_detail, name='empresa_detail'),  # Nueva ruta para el detalle de empresa

]
