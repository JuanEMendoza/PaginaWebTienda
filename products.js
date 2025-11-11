// API endpoint
const API_PRODUCTOS_URL = 'https://apijhon.onrender.com/api/productos';

// Elementos del DOM
let productsTableBody;
let productModal;
let deleteProductModal;
let productForm;
let productErrorMessage;
let currentProductId = null;
let isEditingProduct = false;
let userNameElements;
let userRoleElement;
let logoutButton;

// Verificar sesión al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    // Inicializar elementos del DOM
    productsTableBody = document.getElementById('productsTableBody');
    productModal = document.getElementById('productModal');
    deleteProductModal = document.getElementById('deleteProductModal');
    productForm = document.getElementById('productForm');
    productErrorMessage = document.getElementById('productErrorMessage');
    userNameElements = document.querySelectorAll('#userName');
    userRoleElement = document.getElementById('userRole');
    logoutButton = document.getElementById('logoutButton');
    
    // Asegurar que los modales estén ocultos
    if (productModal) productModal.style.display = 'none';
    if (deleteProductModal) deleteProductModal.style.display = 'none';
    
    // Inicializar event listeners
    initializeEventListeners();
    
    checkSession();
    loadProducts();
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
        if (session.timestamp && Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
            // Sesión expirada
            localStorage.removeItem('adminSession');
            window.location.href = 'index.html';
            return;
        }
        
        // Mostrar información del usuario
        if (session.nombre && userNameElements.length > 0) {
            userNameElements[0].textContent = session.nombre;
        }
        
        if (session.rol && userRoleElement) {
            userRoleElement.textContent = session.rol.charAt(0).toUpperCase() + session.rol.slice(1);
        }
        
    } catch (e) {
        console.error('Error al verificar sesión:', e);
        localStorage.removeItem('adminSession');
        window.location.href = 'index.html';
    }
}

// Inicializar event listeners
function initializeEventListeners() {
    // Botón de cerrar sesión
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                localStorage.removeItem('adminSession');
                window.location.href = 'index.html';
            }
        });
    }
    
    // Event listeners para productos
    const addProductButton = document.getElementById('addProductButton');
    const refreshProductsButton = document.getElementById('refreshProductsButton');
    
    if (addProductButton) {
        addProductButton.addEventListener('click', () => openAddProductModal());
    }
    
    if (refreshProductsButton) {
        refreshProductsButton.addEventListener('click', () => {
            loadProducts();
            refreshProductsButton.style.transform = 'rotate(360deg)';
            refreshProductsButton.style.transition = 'transform 0.5s ease';
            setTimeout(() => {
                refreshProductsButton.style.transform = 'rotate(0deg)';
            }, 500);
        });
    }
    
    // Event listeners para modal de producto
    if (productModal && productForm) {
        const closeProductModalBtn = document.getElementById('closeProductModal');
        const cancelProductBtn = document.getElementById('cancelProduct');
        
        if (closeProductModalBtn) {
            closeProductModalBtn.addEventListener('click', closeProductModal);
        }
        
        if (cancelProductBtn) {
            cancelProductBtn.addEventListener('click', closeProductModal);
        }
        
        // Cerrar modal al hacer click fuera
        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) {
                closeProductModal();
            }
        });
        
        // Guardar producto
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Event listeners para modal de eliminar producto
    if (deleteProductModal) {
        const closeDeleteProductModalBtn = document.getElementById('closeDeleteProductModal');
        const cancelDeleteProductBtn = document.getElementById('cancelDeleteProduct');
        const confirmDeleteProductBtn = document.getElementById('confirmDeleteProduct');
        
        if (closeDeleteProductModalBtn) {
            closeDeleteProductModalBtn.addEventListener('click', closeDeleteProductModal);
        }
        
        if (cancelDeleteProductBtn) {
            cancelDeleteProductBtn.addEventListener('click', closeDeleteProductModal);
        }
        
        // Cerrar modal al hacer click fuera
        deleteProductModal.addEventListener('click', (e) => {
            if (e.target === deleteProductModal) {
                closeDeleteProductModal();
            }
        });
        
        // Confirmar eliminación
        if (confirmDeleteProductBtn) {
            confirmDeleteProductBtn.addEventListener('click', handleDeleteProduct);
        }
    }
}

// Cargar productos desde la API
async function loadProducts() {
    if (!productsTableBody) return;
    
    try {
        productsTableBody.innerHTML = '<tr><td colspan="8" class="loading-row">Cargando productos...</td></tr>';
        
        const response = await fetch(API_PRODUCTOS_URL, {
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
        
        const productos = await response.json();
        
        // Renderizar tabla de productos
        renderProductsTable(productos);
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="loading-row" style="color: var(--error-color);">
                    Error al cargar productos. Por favor, intenta nuevamente.
                </td>
            </tr>
        `;
    }
}

// Renderizar tabla de productos
function renderProductsTable(productos) {
    if (!productsTableBody) return;
    
    if (productos.length === 0) {
        productsTableBody.innerHTML = '<tr><td colspan="8" class="loading-row">No hay productos registrados</td></tr>';
        return;
    }
    
    productsTableBody.innerHTML = productos.map(producto => {
        const precioFormateado = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(producto.precio || 0);
        
        const estadoClass = producto.estado === 'disponible' ? 'activo' : 'inactivo';
        const descripcionCorta = producto.descripcion ? 
            (producto.descripcion.length > 50 ? producto.descripcion.substring(0, 50) + '...' : producto.descripcion) 
            : 'N/A';
        
        return `
            <tr>
                <td>${producto.id_producto}</td>
                <td>${producto.nombre || 'N/A'}</td>
                <td title="${producto.descripcion || ''}">${descripcionCorta}</td>
                <td>${precioFormateado}</td>
                <td>${producto.stock || 0}</td>
                <td>${producto.categoria || 'N/A'}</td>
                <td><span class="status-badge ${estadoClass}">${producto.estado || 'N/A'}</span></td>
                <td class="actions-cell">
                    <button class="btn-action btn-edit" onclick="openEditProductModal(${producto.id_producto})" title="Editar">
                        ✏️ Editar
                    </button>
                    <button class="btn-action btn-delete" onclick="openDeleteProductModal(${producto.id_producto}, '${(producto.nombre || '').replace(/'/g, "\\'")}')" title="Eliminar">
                        🗑️ Eliminar
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Abrir modal para agregar producto
function openAddProductModal() {
    if (!productModal) return;
    
    isEditingProduct = false;
    currentProductId = null;
    
    // Cambiar título
    const modalTitle = document.getElementById('productModalTitle');
    if (modalTitle) modalTitle.textContent = 'Agregar Producto';
    
    // Limpiar formulario
    if (productForm) productForm.reset();
    hideProductError();
    
    // Mostrar modal
    productModal.style.display = 'flex';
}

// Abrir modal para editar producto
window.openEditProductModal = async function(productId) {
    if (!productModal) return;
    
    try {
        // Obtener datos del producto
        const response = await fetch(`${API_PRODUCTOS_URL}/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar datos del producto');
        }
        
        const producto = await response.json();
        
        // Cambiar título
        const modalTitle = document.getElementById('productModalTitle');
        if (modalTitle) modalTitle.textContent = 'Editar Producto';
        
        // Llenar el formulario
        document.getElementById('productId').value = producto.id_producto || '';
        document.getElementById('productNombre').value = producto.nombre || '';
        document.getElementById('productDescripcion').value = producto.descripcion || '';
        document.getElementById('productPrecio').value = producto.precio || 0;
        document.getElementById('productStock').value = producto.stock || 0;
        document.getElementById('productCategoria').value = producto.categoria || '';
        document.getElementById('productEstado').value = producto.estado || 'disponible';
        document.getElementById('productImagen').value = producto.imagen || '';
        
        isEditingProduct = true;
        currentProductId = productId;
        hideProductError();
        
        // Mostrar modal
        productModal.style.display = 'flex';
        
    } catch (error) {
        console.error('Error al abrir modal de edición:', error);
        showProductError('Error al cargar los datos del producto');
    }
};

// Cerrar modal de producto
function closeProductModal() {
    if (productModal) {
        productModal.style.display = 'none';
    }
    if (productForm) {
        productForm.reset();
    }
    hideProductError();
    currentProductId = null;
    isEditingProduct = false;
}

// Guardar producto (agregar o editar)
async function handleProductSubmit(e) {
    e.preventDefault();
    hideProductError();
    
    const productData = {
        nombre: document.getElementById('productNombre').value.trim(),
        descripcion: document.getElementById('productDescripcion').value.trim(),
        precio: parseFloat(document.getElementById('productPrecio').value) || 0,
        stock: parseInt(document.getElementById('productStock').value) || 0,
        categoria: document.getElementById('productCategoria').value.trim(),
        estado: document.getElementById('productEstado').value,
        imagen: document.getElementById('productImagen').value.trim() || ''
    };
    
    // Validaciones
    if (!productData.nombre || !productData.descripcion || !productData.categoria) {
        showProductError('Por favor, completa todos los campos requeridos.');
        return;
    }
    
    if (productData.precio < 0) {
        showProductError('El precio no puede ser negativo.');
        return;
    }
    
    if (productData.stock < 0) {
        showProductError('El stock no puede ser negativo.');
        return;
    }
    
    try {
        let response;
        
        if (isEditingProduct && currentProductId) {
            // Editar producto existente
            // Primero obtener el producto actual para mantener campos que no se editan
            const getResponse = await fetch(`${API_PRODUCTOS_URL}/${currentProductId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'omit'
            });
            
            if (!getResponse.ok) {
                throw new Error('Error al obtener datos del producto');
            }
            
            const productoActual = await getResponse.json();
            
            // Mantener id_producto y fecha_creacion
            productData.id_producto = productoActual.id_producto;
            productData.fecha_creacion = productoActual.fecha_creacion || '';
            
            // Actualizar producto
            response = await fetch(`${API_PRODUCTOS_URL}/${currentProductId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'omit',
                body: JSON.stringify(productData)
            });
        } else {
            // Agregar nuevo producto
            response = await fetch(API_PRODUCTOS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'omit',
                body: JSON.stringify(productData)
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
        
        // Cerrar modal y recargar productos
        closeProductModal();
        loadProducts();
        showSuccessMessage(`Producto ${isEditingProduct ? 'actualizado' : 'agregado'} correctamente`);
        
    } catch (error) {
        console.error('Error al guardar producto:', error);
        showProductError(error.message || 'Error al guardar el producto. Por favor, intenta nuevamente.');
    }
}

// Mostrar/ocultar errores en el modal de producto
function showProductError(message) {
    if (productErrorMessage) {
        productErrorMessage.textContent = message;
        productErrorMessage.style.display = 'block';
    }
}

function hideProductError() {
    if (productErrorMessage) {
        productErrorMessage.textContent = '';
        productErrorMessage.style.display = 'none';
    }
}

// Abrir modal de confirmación para eliminar producto
window.openDeleteProductModal = function(productId, productName) {
    if (!deleteProductModal) return;
    
    document.getElementById('deleteProductName').textContent = productName;
    deleteProductModal.style.display = 'flex';
    currentProductId = productId;
};

// Cerrar modal de eliminación de producto
function closeDeleteProductModal() {
    if (deleteProductModal) {
        deleteProductModal.style.display = 'none';
    }
    currentProductId = null;
}

// Confirmar eliminación de producto
async function handleDeleteProduct() {
    if (!currentProductId) return;
    
    try {
        const response = await fetch(`${API_PRODUCTOS_URL}/${currentProductId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        // Cerrar modal y recargar productos
        closeDeleteProductModal();
        loadProducts();
        showSuccessMessage('Producto eliminado correctamente');
        
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto. Por favor, intenta nuevamente.');
    }
}

// Mostrar mensaje de éxito temporal
function showSuccessMessage(message) {
    // Crear elemento de mensaje de éxito
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = message;
    document.body.appendChild(successMsg);
    
    // Mostrar mensaje
    setTimeout(() => {
        successMsg.classList.add('show');
    }, 10);
    
    // Ocultar y eliminar después de 3 segundos
    setTimeout(() => {
        successMsg.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(successMsg)) {
                document.body.removeChild(successMsg);
            }
        }, 300);
    }, 3000);
}

// Verificar sesión periódicamente (cada minuto)
setInterval(() => {
    checkSession();
}, 60 * 1000);

