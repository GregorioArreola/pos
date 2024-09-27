from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import requests


def index_view(request):
    return render(request, 'admin_pos/index.html')

WEB_SERVICE_EMPRESAS_URL = "https://10.90.10.22:9009/fuggerbooks/ws/ws_listado_empresas_cliente/"

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
