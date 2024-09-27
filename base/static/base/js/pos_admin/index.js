function getCookie(name) {
   var cookieValue = null;
   if (document.cookie && document.cookie !== '') {
       var cookies = document.cookie.split(';');
       for (var i = 0; i < cookies.length; i++) {
           var cookie = cookies[i].trim();
           if (cookie.substring(0, name.length + 1) === (name + '=')) {
               cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
               break;
           }
       }
   }
   return cookieValue;
}
var csrftoken = getCookie('csrftoken'); 
$.ajaxSetup({
   beforeSend: function(xhr, settings) {
       if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
           xhr.setRequestHeader("X-CSRFToken", csrftoken);
       }
   }
});

var empresas = []; 
$(document).ready(function() {
   fnCargarEmpresas();  

   $('#buscar-empresas').on('input', function() {
      var textoBusqueda = $(this).val().toLowerCase(); 
      filtrarEmpresas(textoBusqueda);   
  });

  $('#ordenar-empresas').on('change', function() {
   ordenarEmpresas($(this).val());
});
});

$(document).on("click", ".card", function() {
});
function fnCargarEmpresas() {
   $("#loader").show(); 
   $("#empresa-container").hide();  
   
   $.ajax({
       url: "/obtener_empresas/",
       type: "POST",
       data: {
           csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()  
       },
   }).done(function(respuesta) {
       if (respuesta.exito) {
           empresas = respuesta.empresas; 
           mostrarEmpresas(empresas);  
       } else {
           alert(respuesta.error || "Error al cargar las empresas");
       }
   }).fail(function() {
       alert("Error al cargar las empresas");
   }).always(function() {
       $("#loader").hide(); 
       $("#empresa-container").show();  
   });
}

function mostrarEmpresas(empresas) {
   $("#empresa-container").empty();
      empresas.forEach(function(empresa) {
       crearRecuadroEmpresa(empresa);
   });
}

function ordenarEmpresas(criterio) {
   var empresasOrdenadas = [...empresas]; 

   if (criterio === "nombre-asc") {
       empresasOrdenadas.sort(function(a, b) {
           return a.nombre_comercial.toLowerCase().localeCompare(b.nombre_comercial.toLowerCase());
       });
   } else if (criterio === "nombre-desc") {
       empresasOrdenadas.sort(function(a, b) {
           return b.nombre_comercial.toLowerCase().localeCompare(a.nombre_comercial.toLowerCase());
       });
   } else if (criterio === "fecha-asc") {
       empresasOrdenadas.sort(function(a, b) {
           return new Date(a.fecha_vigencia) - new Date(b.fecha_vigencia);  
       });
   } else if (criterio === "fecha-desc") {
       empresasOrdenadas.sort(function(a, b) {
           return new Date(b.fecha_vigencia) - new Date(a.fecha_vigencia);  
       });
   }

   mostrarEmpresas(empresasOrdenadas);
}

function filtrarEmpresas(textoBusqueda) {
   var empresasFiltradas = empresas.filter(function(empresa) {
       return empresa.nombre_comercial.toLowerCase().includes(textoBusqueda);
   });
   mostrarEmpresas(empresasFiltradas);
}

function crearRecuadroEmpresa(empresa) {
   var logoBase64 = empresa.logo;  
   var formato = empresa.formato ? empresa.formato.toLowerCase() : 'png';  

   var mimeType = '';
   if (formato === 'png') {
       mimeType = 'image/png';
   } else if (formato === 'jpg' || formato === 'jpeg') {
       mimeType = 'image/jpeg';
   } else {
       mimeType = 'image/png';
   }

   var logoUrl = logoBase64 ? `data:${mimeType};base64,${logoBase64}` : '/path/to/default/logo.png';

   $("#empresa-container").append(`
       <div class="card" data-id="${empresa.empresa_id}">
           <img class="empresa-logo" src="${logoUrl}" alt="Logo de ${empresa.nombre_comercial}">
           <h3 class="empresa-nombre">${empresa.nombre_comercial}</h3>
           <p class="empresa-fecha">${empresa.fecha_vigencia}</p>
           <p class="empresa-tipo">${empresa.tipo}</p>
       </div>
   `);
}


$("#logout-btn").on("click", function() { 
   $.ajax({
      url: "/logout/",
      type: "POST",
      data: {
         csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val()  
      },
   }).done(function() {
      window.location.href = "/";  
   }).fail(function() {
      alert("Error al intentar cerrar sesión");
   });
});
