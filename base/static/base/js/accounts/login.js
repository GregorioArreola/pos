$(document).ready(function () {
    
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const csrftoken = getCookie('csrftoken');

    // Configurar todas las solicitudes AJAX para incluir el token CSRF
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!/^((GET|HEAD|OPTIONS|TRACE))$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    function toggleModal(modalId, show = true) {
        $(modalId).toggle(show);
    }

    function submitFormAjax(formId, url, successCallback) {
        $(formId).submit(function(event) {
            event.preventDefault();
            $.ajax({
                url: url,
                type: "POST",
                data: $(this).serialize()
            }).done(successCallback)
            .fail(() => alert('Error al procesar la solicitud.'));
        });
    }

    $("#loginForm").validate({
        rules: {
            email: { required: true, email: true },
            password: { required: true, minlength: 6 }
        },
        messages: {
            email: { required: "Ingrese su correo", email: "Ingrese una dirección válida" },
            password: { required: "Ingrese su contraseña", minlength: "Debe tener al menos 6 caracteres" }
        },
        submitHandler: function(form) {
            $.ajax({
                url: loginUrl,  // Aquí se usa `loginUrl` que se definió en el HTML
                type: "POST",
                data: $(form).serialize()
            }).done(function(response) {
                if (response.success) {
                    window.location.href = adminIndexUrl;
                } else {
                    alert('Correo o contraseña inválido');
                }
            }).fail(() => alert('Error al conectarse al servicio de autenticación.'));
        }
    });

    $("#forgotPasswordBtn").click(() => toggleModal("#forgotPasswordModal", true));
    $(".closeModal").click(() => toggleModal(".modal", false));

    // Usar la variable `forgotPasswordUrl` definida en el HTML
    submitFormAjax("#forgotPasswordForm", forgotPasswordUrl, function(response) {
        if (response === 'exito') {
            toggleModal("#forgotPasswordModal", false);
            toggleModal("#successModal", true);
        }
    });
});
