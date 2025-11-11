// API endpoints
const API_PEDIDOS_URL = 'https://apijhon.onrender.com/api/pedidos';
const API_PEDIDO_DETALLE_URL = 'https://apijhon.onrender.com/api/pedido_detalle';
const API_USUARIOS_URL = 'https://apijhon.onrender.com/api/usuarios';

// Elementos del DOM
let ordersTableBody;
let orderDetailsModal;
let changeStatusModal;
let orderDetailsContent;
let changeStatusOrderId;
let newStatus;
let changeStatusErrorMessage;
let userNameElements;
let userRoleElement;
let logoutButton;

// Variables para filtrado
let allOrders = [];
let filteredOrders = [];
let filterEstadoPedido;
let searchOrderInput;
let clearOrderFiltersButton;
let ordersCountNumber;
let noOrdersMessage;
let currentOrderId = null;

// Verificar sesión al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    // Inicializar elementos del DOM
    ordersTableBody = document.getElementById('ordersTableBody');
    orderDetailsModal = document.getElementById('orderDetailsModal');
    changeStatusModal = document.getElementById('changeStatusModal');
    orderDetailsContent = document.getElementById('orderDetailsContent');
    changeStatusOrderId = document.getElementById('changeStatusOrderId');
    newStatus = document.getElementById('newStatus');
    changeStatusErrorMessage = document.getElementById('changeStatusErrorMessage');
    userNameElements = document.querySelectorAll('#userName');
    userRoleElement = document.getElementById('userRole');
    logoutButton = document.getElementById('logoutButton');
    
    // Elementos de filtrado
    filterEstadoPedido = document.getElementById('filterEstadoPedido');
    searchOrderInput = document.getElementById('searchOrderInput');
    clearOrderFiltersButton = document.getElementById('clearOrderFiltersButton');
    ordersCountNumber = document.getElementById('ordersCountNumber');
    noOrdersMessage = document.getElementById('noOrdersMessage');
    
    // Asegurar que los modales estén ocultos
    if (orderDetailsModal) orderDetailsModal.style.display = 'none';
    if (changeStatusModal) changeStatusModal.style.display = 'none';
    
    // Inicializar event listeners
    initializeEventListeners();
    
    checkSession();
    loadOrders();
});

// Verificar si hay una sesión válida
function checkSession() {
    const adminSession = localStorage.getItem('adminSession');
    
    if (!adminSession) {
        // No hay sesión, redirigir al login
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const session = JSON.parse(adminSession);
        
        // Verificar que la sesión no haya expirado (24 horas)
        // Compatible con ambas estructuras: timestamp o expiresAt
        if (session.timestamp && Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
            // Sesión expirada
            localStorage.removeItem('adminSession');
            window.location.href = 'index.html';
            return;
        }
        
        // Verificar expiresAt si existe
        if (session.expiresAt && Date.now() > session.expiresAt) {
            localStorage.removeItem('adminSession');
            window.location.href = 'index.html';
            return;
        }
        
        // Mostrar información del usuario
        // Compatible con ambas estructuras: session.nombre o session.user.nombre
        const nombre = session.nombre || (session.user && session.user.nombre) || 'Administrador';
        const rol = session.rol || (session.user && session.user.rol) || 'Admin';
        
        if (userNameElements.length > 0) {
            userNameElements.forEach(el => {
                el.textContent = nombre;
            });
        }
        
        if (userRoleElement) {
            userRoleElement.textContent = rol.charAt(0).toUpperCase() + rol.slice(1);
        }
        
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        localStorage.removeItem('adminSession');
        window.location.href = 'index.html';
    }
}

// Inicializar event listeners
function initializeEventListeners() {
    // Logout
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('adminSession');
            window.location.href = 'index.html';
        });
    }
    
    // Refrescar pedidos
    const refreshOrdersButton = document.getElementById('refreshOrdersButton');
    if (refreshOrdersButton) {
        refreshOrdersButton.addEventListener('click', () => {
            loadOrders();
            refreshOrdersButton.style.transform = 'rotate(360deg)';
            refreshOrdersButton.style.transition = 'transform 0.5s ease';
            setTimeout(() => {
                refreshOrdersButton.style.transform = 'rotate(0deg)';
            }, 500);
        });
    }
    
    // Filtros
    if (filterEstadoPedido) {
        filterEstadoPedido.addEventListener('change', handleFilterOrders);
    }
    
    if (searchOrderInput) {
        searchOrderInput.addEventListener('input', handleFilterOrders);
    }
    
    if (clearOrderFiltersButton) {
        clearOrderFiltersButton.addEventListener('click', () => {
            if (filterEstadoPedido) filterEstadoPedido.value = '';
            if (searchOrderInput) searchOrderInput.value = '';
            handleFilterOrders();
        });
    }
    
    // Modal de detalles
    const closeOrderDetailsModalBtn = document.getElementById('closeOrderDetailsModal');
    const closeOrderDetailsBtn = document.getElementById('closeOrderDetailsBtn');
    
    if (closeOrderDetailsModalBtn) {
        closeOrderDetailsModalBtn.addEventListener('click', closeOrderDetailsModal);
    }
    
    if (closeOrderDetailsBtn) {
        closeOrderDetailsBtn.addEventListener('click', closeOrderDetailsModal);
    }
    
    // Cerrar modal al hacer click fuera
    if (orderDetailsModal) {
        orderDetailsModal.addEventListener('click', (e) => {
            if (e.target === orderDetailsModal) {
                closeOrderDetailsModal();
            }
        });
    }
    
    // Modal de cambiar estado
    const closeChangeStatusModalBtn = document.getElementById('closeChangeStatusModal');
    const cancelChangeStatusBtn = document.getElementById('cancelChangeStatus');
    const confirmChangeStatusBtn = document.getElementById('confirmChangeStatus');
    
    if (closeChangeStatusModalBtn) {
        closeChangeStatusModalBtn.addEventListener('click', closeChangeStatusModal);
    }
    
    if (cancelChangeStatusBtn) {
        cancelChangeStatusBtn.addEventListener('click', closeChangeStatusModal);
    }
    
    if (confirmChangeStatusBtn) {
        confirmChangeStatusBtn.addEventListener('click', handleChangeStatus);
    }
    
    // Cerrar modal al hacer click fuera
    if (changeStatusModal) {
        changeStatusModal.addEventListener('click', (e) => {
            if (e.target === changeStatusModal) {
                closeChangeStatusModal();
            }
        });
    }
}

// Cargar pedidos desde la API
async function loadOrders() {
    if (!ordersTableBody) return;
    
    try {
        ordersTableBody.innerHTML = '<tr><td colspan="8" class="loading-row">Cargando pedidos...</td></tr>';
        
        const response = await fetch(API_PEDIDOS_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }
        
        const pedidos = await response.json();
        
        // Guardar todos los pedidos
        allOrders = pedidos;
        
        // Aplicar filtros
        handleFilterOrders();
        
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="loading-row" style="color: var(--error-color);">
                    Error al cargar pedidos. Por favor, intenta nuevamente.
                </td>
            </tr>
        `;
    }
}

// Manejar filtrado de pedidos
function handleFilterOrders() {
    if (!allOrders || allOrders.length === 0) return;
    
    const estadoFilter = filterEstadoPedido ? filterEstadoPedido.value : '';
    const searchTerm = searchOrderInput ? searchOrderInput.value.toLowerCase().trim() : '';
    
    // Filtrar pedidos
    filteredOrders = allOrders.filter(pedido => {
        // Filtro de estado
        const matchesEstado = !estadoFilter || 
            pedido.estado?.toLowerCase() === estadoFilter.toLowerCase() ||
            (estadoFilter === 'en preparación' && pedido.estado?.toLowerCase() === 'en preparacion');
        
        // Filtro de búsqueda
        const matchesSearch = !searchTerm || 
            pedido.id_pedido?.toString().includes(searchTerm) ||
            pedido.id_usuario?.toString().includes(searchTerm);
        
        return matchesEstado && matchesSearch;
    });
    
    // Renderizar tabla
    renderOrdersTable(filteredOrders);
    
    // Actualizar contador
    updateOrdersCount();
}

// Actualizar contador de pedidos
function updateOrdersCount() {
    if (ordersCountNumber) {
        ordersCountNumber.textContent = filteredOrders.length;
    }
    
    // Mostrar/ocultar mensaje de no pedidos
    if (noOrdersMessage) {
        noOrdersMessage.style.display = filteredOrders.length === 0 ? 'block' : 'none';
    }
    
    // Ocultar tabla si no hay pedidos
    const tableContainer = document.querySelector('.orders-table-container');
    if (tableContainer) {
        tableContainer.style.display = filteredOrders.length === 0 ? 'none' : 'block';
    }
}

// Renderizar tabla de pedidos
function renderOrdersTable(pedidos) {
    if (!ordersTableBody) return;
    
    if (!pedidos || pedidos.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="8" class="loading-row">No hay pedidos para mostrar</td></tr>';
        return;
    }
    
    // Ordenar por fecha (más recientes primero)
    const sortedPedidos = [...pedidos].sort((a, b) => {
        const dateA = new Date(a.fecha_pedido);
        const dateB = new Date(b.fecha_pedido);
        return dateB - dateA;
    });
    
    ordersTableBody.innerHTML = sortedPedidos.map(pedido => {
        const fechaFormateada = new Date(pedido.fecha_pedido).toLocaleString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const totalFormateado = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(pedido.total || 0);
        
        const estadoClass = getEstadoClass(pedido.estado);
        const direccionCorta = pedido.direccion_envio ? 
            (pedido.direccion_envio.length > 30 ? pedido.direccion_envio.substring(0, 30) + '...' : pedido.direccion_envio) 
            : 'N/A';
        
        return `
            <tr>
                <td>${pedido.id_pedido}</td>
                <td>${pedido.id_usuario}</td>
                <td>${fechaFormateada}</td>
                <td>${totalFormateado}</td>
                <td><span class="status-badge ${estadoClass}">${pedido.estado || 'N/A'}</span></td>
                <td title="${pedido.direccion_envio || ''}">${direccionCorta}</td>
                <td>${pedido.id_metodo || 'N/A'}</td>
                <td class="actions-cell">
                    <button class="btn-action btn-view" onclick="openOrderDetailsModal(${pedido.id_pedido})" title="Ver Detalles">
                        👁️ Ver
                    </button>
                    <button class="btn-action btn-edit" onclick="openChangeStatusModal(${pedido.id_pedido}, '${(pedido.estado || '').replace(/'/g, "\\'")}')" title="Cambiar Estado">
                        ✏️ Estado
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Obtener clase CSS para el estado
function getEstadoClass(estado) {
    if (!estado) return 'inactivo';
    
    const estadoLower = estado.toLowerCase();
    
    if (estadoLower.includes('entregado')) {
        return 'activo';
    } else if (estadoLower.includes('enviado')) {
        return 'preparacion';
    } else if (estadoLower.includes('preparaci') || estadoLower.includes('preparacion')) {
        return 'preparacion';
    } else if (estadoLower.includes('pendiente')) {
        return 'preparacion';
    } else if (estadoLower.includes('cancelado')) {
        return 'inactivo';
    }
    
    return 'preparacion';
}

// Abrir modal de detalles del pedido
window.openOrderDetailsModal = async function(orderId) {
    if (!orderDetailsModal) return;
    
    try {
        orderDetailsContent.innerHTML = '<div class="loading-container"><p>Cargando detalles...</p></div>';
        orderDetailsModal.style.display = 'flex';
        
        // Obtener datos del pedido
        const pedidoResponse = await fetch(`${API_PEDIDOS_URL}/${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!pedidoResponse.ok) {
            throw new Error('Error al cargar datos del pedido');
        }
        
        const pedido = await pedidoResponse.json();
        
        // Obtener detalles del pedido (productos)
        const detallesResponse = await fetch(API_PEDIDO_DETALLE_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        });
        
        let detallesPedido = [];
        if (detallesResponse.ok) {
            const todosDetalles = await detallesResponse.json();
            detallesPedido = todosDetalles.filter(d => d.id_pedido === orderId);
        }
        
        // Obtener información del usuario
        let usuario = null;
        if (pedido.id_usuario) {
            try {
                const usuarioResponse = await fetch(`${API_USUARIOS_URL}/${pedido.id_usuario}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    mode: 'cors',
                    credentials: 'omit'
                });
                
                if (usuarioResponse.ok) {
                    usuario = await usuarioResponse.json();
                }
            } catch (error) {
                console.error('Error al cargar usuario:', error);
            }
        }
        
        // Renderizar detalles
        renderOrderDetails(pedido, detallesPedido, usuario);
        
    } catch (error) {
        console.error('Error al abrir modal de detalles:', error);
        orderDetailsContent.innerHTML = `
            <div class="error-message" style="display: block;">
                Error al cargar los detalles del pedido. Por favor, intenta nuevamente.
            </div>
        `;
    }
};

// Renderizar detalles del pedido
async function renderOrderDetails(pedido, detallesPedido, usuario) {
    if (!orderDetailsContent) return;
    
    const fechaFormateada = new Date(pedido.fecha_pedido).toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const totalFormateado = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(pedido.total || 0);
    
    const estadoClass = getEstadoClass(pedido.estado);
    
    // Obtener nombres de productos si hay detalles
    let productosHTML = '';
    if (detallesPedido && detallesPedido.length > 0) {
        // Obtener productos
        try {
            const productosResponse = await fetch('https://apijhon.onrender.com/api/productos', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (productosResponse.ok) {
                const productos = await productosResponse.json();
                const productosMap = {};
                productos.forEach(p => {
                    productosMap[p.id_producto] = p;
                });
                
                productosHTML = `
                    <div class="order-products-section">
                        <h3>Productos del Pedido</h3>
                        <table class="order-products-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unitario</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${detallesPedido.map(detalle => {
                                    const producto = productosMap[detalle.id_producto];
                                    const nombreProducto = producto ? producto.nombre : `Producto #${detalle.id_producto}`;
                                    const precioUnitario = new Intl.NumberFormat('es-CO', {
                                        style: 'currency',
                                        currency: 'COP',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }).format(detalle.precio_unitario || 0);
                                    const subtotal = new Intl.NumberFormat('es-CO', {
                                        style: 'currency',
                                        currency: 'COP',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }).format(detalle.subtotal || 0);
                                    
                                    return `
                                        <tr>
                                            <td>${nombreProducto}</td>
                                            <td>${detalle.cantidad || 0}</td>
                                            <td>${precioUnitario}</td>
                                            <td>${subtotal}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }
    
    const html = `
        <div class="order-details-content">
            <div class="order-info-section">
                <h3>Información del Pedido</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <label>ID Pedido:</label>
                        <span>#${pedido.id_pedido}</span>
                    </div>
                    <div class="info-item">
                        <label>Fecha:</label>
                        <span>${fechaFormateada}</span>
                    </div>
                    <div class="info-item">
                        <label>Estado:</label>
                        <span class="status-badge ${estadoClass}">${pedido.estado || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <label>Total:</label>
                        <span class="total-amount">${totalFormateado}</span>
                    </div>
                </div>
            </div>
            
            <div class="order-info-section">
                <h3>Información del Cliente</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <label>ID Usuario:</label>
                        <span>${pedido.id_usuario || 'N/A'}</span>
                    </div>
                    ${usuario ? `
                        <div class="info-item">
                            <label>Nombre:</label>
                            <span>${usuario.nombre || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <label>Email:</label>
                            <span>${usuario.correo || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <label>Teléfono:</label>
                            <span>${usuario.telefono || 'N/A'}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="order-info-section">
                <h3>Dirección de Envío</h3>
                <div class="info-item full-width">
                    <label>Dirección:</label>
                    <span>${pedido.direccion_envio || 'N/A'}</span>
                </div>
            </div>
            
            <div class="order-info-section">
                <h3>Información de Pago</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <label>Método de Pago:</label>
                        <span>ID Método: ${pedido.id_metodo || 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            ${productosHTML}
        </div>
    `;
    
    orderDetailsContent.innerHTML = html;
}

// Cerrar modal de detalles
function closeOrderDetailsModal() {
    if (orderDetailsModal) {
        orderDetailsModal.style.display = 'none';
    }
    if (orderDetailsContent) {
        orderDetailsContent.innerHTML = '';
    }
}

// Abrir modal para cambiar estado
window.openChangeStatusModal = function(orderId, currentStatus) {
    if (!changeStatusModal) return;
    
    currentOrderId = orderId;
    if (changeStatusOrderId) {
        changeStatusOrderId.textContent = orderId;
    }
    
    if (newStatus) {
        // Normalizar estado actual para comparación
        let normalizedStatus = currentStatus?.toLowerCase() || 'pendiente';
        if (normalizedStatus.includes('preparacion')) {
            normalizedStatus = 'en preparación';
        }
        
        // Establecer el valor en el select
        newStatus.value = normalizedStatus;
    }
    
    hideChangeStatusError();
    changeStatusModal.style.display = 'flex';
};

// Cerrar modal de cambiar estado
function closeChangeStatusModal() {
    if (changeStatusModal) {
        changeStatusModal.style.display = 'none';
    }
    currentOrderId = null;
    hideChangeStatusError();
}

// Manejar cambio de estado
async function handleChangeStatus() {
    if (!currentOrderId || !newStatus) return;
    
    hideChangeStatusError();
    
    const nuevoEstado = newStatus.value;
    
    if (!nuevoEstado) {
        showChangeStatusError('Por favor, selecciona un estado.');
        return;
    }
    
    try {
        // Primero obtener el pedido actual
        const getResponse = await fetch(`${API_PEDIDOS_URL}/${currentOrderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!getResponse.ok) {
            throw new Error('Error al obtener datos del pedido');
        }
        
        const pedidoActual = await getResponse.json();
        
        // Actualizar solo el estado
        const pedidoActualizado = {
            ...pedidoActual,
            estado: nuevoEstado
        };
        
        // Actualizar pedido
        const response = await fetch(`${API_PEDIDOS_URL}/${currentOrderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit',
            body: JSON.stringify(pedidoActualizado)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
        
        // Cerrar modal y recargar pedidos
        closeChangeStatusModal();
        loadOrders();
        showSuccessMessage('Estado del pedido actualizado correctamente');
        
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        showChangeStatusError(error.message || 'Error al cambiar el estado del pedido. Por favor, intenta nuevamente.');
    }
}

// Mostrar/ocultar errores en el modal de cambiar estado
function showChangeStatusError(message) {
    if (changeStatusErrorMessage) {
        changeStatusErrorMessage.textContent = message;
        changeStatusErrorMessage.style.display = 'block';
    }
}

function hideChangeStatusError() {
    if (changeStatusErrorMessage) {
        changeStatusErrorMessage.textContent = '';
        changeStatusErrorMessage.style.display = 'none';
    }
}

// Mostrar mensaje de éxito temporal
function showSuccessMessage(message) {
    // Crear elemento de mensaje de éxito
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = message;
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #22c55e;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(successMsg);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        successMsg.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.parentNode.removeChild(successMsg);
            }
        }, 300);
    }, 3000);
}

// Verificar sesión periódicamente (cada minuto)
setInterval(() => {
    checkSession();
}, 60 * 1000);

