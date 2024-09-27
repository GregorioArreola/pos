import requests
from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from .forms import LoginForm
from django.views.decorators.csrf import csrf_exempt
import urllib3

WEB_SERVICE_URL = "https://10.90.10.22:9009/fuggerbooks/ws/ws_genera_token_usuario"
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
def login_view(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            try:
                response = requests.post(WEB_SERVICE_URL, data={
                    'usuario': email,
                    'contrasena': password
                }, verify=False, timeout=10)
                response_data = response.json()

                if response_data.get('exito'):
                    token = response_data.get('token')
                    request.session['token'] = token  
                    request.session['correo'] = email  
                    return JsonResponse({'success': True})
                else:
                    return JsonResponse({'success': False, 'error': 'Correo o contraseña inválido'})
            except requests.exceptions.Timeout:
                return JsonResponse({'success': False, 'error': 'Tiempo de espera agotado. Intenta nuevamente.'})
            except requests.exceptions.RequestException as e:
                return JsonResponse({'success': False, 'error': 'Error al conectarse al servicio de autenticación'})
        else:
            return JsonResponse({'success': False, 'error': 'Formulario inválido'})
    else:
        form = LoginForm()
    return render(request, 'accounts/login.html', {'form': form})

@csrf_exempt
def recuperar(request):
    if request.method == 'POST':
        return JsonResponse('exito', safe=False)
    return JsonResponse('error', safe=False)