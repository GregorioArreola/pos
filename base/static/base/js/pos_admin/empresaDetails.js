$(document).ready(function() {
    var empresa_id = $('#select-productos').data('empresa-id');
    $('#select-productos').select2({
        ajax: {
            url: '/obtener_productos/',
            dataType: 'json',
            data: function (params) {
                return {
                    q: params.term || '',  
                    page: params.page || 1,  
                    empresa_id: empresa_id  
                };
            },
            processResults: function (data, params) {
                params.page = params.page || 1;
                return {
                    results: data.productos.map(function(producto) {
                        return {
                            id: producto.clave,  
                            text: producto.nombre,  
                            descripcion: producto.descripcion,  
                            foto_producto: producto.foto_producto,
                            clave: producto.clave
                        };
                    }),
                    pagination: {
                        more: data.has_more 
                    }
                };
            },
            cache: true  
        },
        placeholder: 'Buscar productos...',
        templateResult: function (producto) {
            if (producto.loading) return producto.text;
            if (!producto.text) return null;

            var imagen_url = `https://10.90.10.22:9009/fuggerbooks/${producto.foto_producto || 'static/images/img-default-2.png'}`;

            var $container = $(`
                <div class="select2-result-producto">
                    <div class="select2-producto__image">
                        <img src="${imagen_url}" alt="${producto.text}" style="width: 50px; height: 50px;"/>
                    </div>
                    <div class="select2-producto__title">${producto.text}</div>
                    <div class="select2-producto__description">${producto.descripcion || ''}</div>
                    <div class="select2-producto__clave">Clave: ${producto.clave}</div>  <!-- Mostramos la clave -->
                </div>
            `);
            return $container;
        },
        templateSelection: function (producto) {
            return producto.text || producto.id;
        }
    });
});
