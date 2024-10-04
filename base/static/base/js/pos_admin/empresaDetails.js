$(document).ready(function() {
    var empresa_id = $('#select-productos').data('empresa-id');
    var productosAñadidos = {};

    var productosTabla = $('#productos-table').DataTable({
        paging: false,  
        searching: false,  
        info: false,
        scrollY: 800,
        language: {
            emptyTable: "No se han añadido productos"
        },
        columns: [
            { 
                data: 'nombre',
                title: 'Producto',
                width: '20%' 
            },  
            { 
                data: 'foto', 
                title: 'Imagen', 
                width: '20%', 
                class: 'text-center' 
            },  
            {
                 data: 'descripcion', 
                 title: 'Descripción', 
                 width: '25%' 
            },  
            { 
                data: 'precio', 
                title: 'P.U', 
                width: '10%', 
                class: 'text-right', 
                render: $.fn.dataTable.render.number(',', '.', 2, '$')  
            },
            { 
                data: 'cantidad', 
                title: 'Cantidad', 
                width: '15%', 
                class: 'text-center',
                render: function(data, type) {
                    if (type === 'display') {
                        
                        return `
                            <div class="input-group">
                                <button class="btn btn-sm btn-outline-secondary btn-restar-cantidad">-</button>
                                <input type="text" class="form-control form-control-sm text-center cantidad" value="${data}" style="width: 40px;" readonly>
                                <button class="btn btn-sm btn-outline-secondary btn-sumar-cantidad">+</button>
                            </div>
                        `;
                    }
                    return data;  
                }
            },
            { 
                data: 'importe', 
                title: 'Importe', 
                width: '15%', 
                class: 'text-right',
                render: function(data, type, row) {
                    return $.fn.dataTable.render.number(',', '.', 2, '$').display(row.precio * row.cantidad);

                }
            },
            { 
                data: 'acciones',  
                title: 'Acciones', 
                width: '10%', 
                class: 'text-center',
                render: function(data, type) {
                    if (type === 'display') {
                        return `<button class="btn btn-danger btn-sm btn-eliminar-producto">Eliminar</button>`;
                    }
                    return data;
                }
            }
        ],
            footerCallback: function(row, data, start, end, display) {
                var totalVenta = 0;
                for (var i = 0; i < data.length; i++) {
                    totalVenta += data[i].precio * data[i].cantidad;
                }

                // Actualizar el contenedor con el total de la venta
                $('#total-venta').text($.fn.dataTable.render.number(',', '.', 2, '$').display(totalVenta));
            }
    });

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
                            precio: producto.precio,
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
                    <div class="select2-producto__clave">Clave: ${producto.clave}</div>
                </div>
            `);
            return $container;
        },
        templateSelection: function (producto) {
            return producto.text || producto.id;
        }
    });

    $('#btn-anadir-producto').on('click', function() {
        var producto = $('#select-productos').select2('data')[0];
        
        if (producto) {
            if (productosAñadidos[producto.clave]) {

                var row = productosAñadidos[producto.clave].row;
                var cantidadInput = $(row).find('.cantidad');
                var cantidadActual = parseInt(cantidadInput.val());
                cantidadInput.val(cantidadActual + 1);
            } else {

                var nuevoProducto = {
                    nombre: producto.text,  
                    foto: `<img src="https://10.90.10.22:9009/fuggerbooks/${producto.foto_producto}" style="width: 50px; height: 50px;">`,  
                    descripcion: producto.descripcion,  
                    precio: parseFloat(producto.precio).toFixed(2),  
                    cantidad: 1, 
                    acciones: `<button class="btn btn-danger btn-sm btn-eliminar-producto">Eliminar</button>`  
                };
                
                var newRow = productosTabla.row.add(nuevoProducto).draw().node();
                
                productosAñadidos[producto.clave] = { row: newRow };
            }
        } else {
            console.log("No se seleccionó ningún producto");
        }
    });

    $('#productos-table').on('click', '.btn-sumar-cantidad', function() {
        var row = $(this).closest('tr');
        var input = $(row).find('.cantidad');
        var cantidad = parseInt(input.val());
        input.val(cantidad + 1);
    
        productosTabla.cell(row, 4).data(cantidad + 1).draw();  
        productosTabla.cell(row, 5).invalidate().draw(); 
    });
    
    $('#productos-table').on('click', '.btn-restar-cantidad', function() {
        var row = $(this).closest('tr');
        var input = $(row).find('.cantidad');
        var cantidad = parseInt(input.val());
        if (cantidad > 1) {
            input.val(cantidad - 1);
    
            productosTabla.cell(row, 4).data(cantidad - 1).draw();  
            productosTabla.cell(row, 5).invalidate().draw();  
        }
    });
    

    $('#productos-table').on('click', '.btn-eliminar-producto', function() {
        var row = $(this).closest('tr');
        var data = productosTabla.row(row).data();
        
        var productoClave = Object.keys(productosAñadidos).find(clave => productosAñadidos[clave].row === row[0]);
        
        if (productoClave) {
            delete productosAñadidos[productoClave];
        }
        productosTabla.row(row).remove().draw();
    });
});
