from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import requests
from django.views.decorators.http import require_GET
import json
def index_view(request):
    return render(request, 'admin_pos/index.html')

WEB_SERVICE_EMPRESAS_URL = "https://10.90.10.22:9009/fuggerbooks/ws/ws_listado_empresas_cliente/"
WEB_SERVICE_PRODUCTOS_URL="https://10.90.10.22:9009/fuggerbooks/ws/ws_listado_empresas_productos/"

@require_POST
def obtener_empresas(request):
    token = request.session.get('token')
    correo = request.session.get('correo')

    if not token or not correo:
        return JsonResponse({'exito': False, 'error': 'Usuario no autenticado'})

    try:
        response = requests.post(
            WEB_SERVICE_EMPRESAS_URL,
            data={'correo': correo, 'token': token},
            timeout=10,  
            verify=False  
        )
        data = response.json()
        empresas = data.get('empresas', [])
        if empresas:
            return JsonResponse({'exito': True, 'empresas': empresas})
        else:
            return JsonResponse({'exito': False, 'error': 'No se encontraron empresas'})

    except requests.exceptions.RequestException as e:
        return JsonResponse({'exito': False, 'error': 'Error al conectarse al servicio de empresas'})

@require_GET
def obtener_productos(request):
    token = request.session.get('token')
    empresa_id = request.GET.get('empresa_id')
    search_term = request.GET.get('q', '').lower()  
    page = int(request.GET.get('page', 1)) 
    items_per_page = 5  

    if not token or not empresa_id:
        return JsonResponse({'productos': [], 'has_more': False})

    try:
        response = requests.post(
            WEB_SERVICE_PRODUCTOS_URL,
            data={
                'token': token,
                'empresa_id': empresa_id
            },
            timeout=10,
            verify=False
        )

        data = response.json()

        if 'data' not in response.json():
            return JsonResponse({'productos': [], 'has_more': False, 'error': 'No se encontraron datos'})

        productos_data = json.loads(data['data'])
        productos = productos_data.get('productos', [])
        
        if search_term:
            productos = [producto for producto in productos if search_term in producto['nombre'].lower() or search_term in producto['clave'].lower()]

        start = (page - 1) * items_per_page
        end = start + items_per_page
        productos_paginados = productos[start:end]
        has_more = end < len(productos)

        return JsonResponse({'productos': productos_paginados, 'has_more': has_more})

    except requests.exceptions.RequestException as e:
        return JsonResponse({'productos': [], 'has_more': False, 'error': 'Error al conectarse con el web service'})
    
def empresa_detail(request, empresa_id):
    context = {
    'empresa_id': empresa_id  
    }
    return render(request, 'admin_pos/empresaDetails.html', context)