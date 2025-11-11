// API endpoint
const API_URL = 'https://apijhon.onrender.com/api/usuarios';

// Elementos del DOM
let userNameElements;
let userRoleElement;
let logoutButton;
let refreshButton;
let usersTableBody;
let totalUsersElement;
let activeUsersElement;
let clientsCountElement;
let adminsCountElement;

// Variables para modales
let currentUserId = null;
let editModal;
let deleteModal;
let editUserForm;
let editErrorMessage;

// Verificar sesión al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    // Inicializar elementos del DOM
    userNameElements = document.querySelectorAll('#userName, #welcomeName');
    userRoleElement = document.getElementById('userRole');
    logoutButton = document.getElementById('logoutButton');
    refreshButton = document.getElementById('refreshButton');
    usersTableBody = document.getElementById('usersTableBody');
    totalUsersElement = document.getElementById('totalUsers');
    activeUsersElement = document.getElementById('activeUsers');
    clientsCountElement = document.getElementById('clientsCount');
    adminsCountElement = document.getElementById('adminsCount');
    
    // Inicializar modales
    editModal = document.getElementById('editModal');
    deleteModal = document.getElementById('deleteModal');
    editUserForm = document.getElementById('editUserForm');
    editErrorMessage = document.getElementById('editErrorMessage');
    
    // Asegurar que los modales estén ocultos
    if (editModal) editModal.style.display = 'none';
    if (deleteModal) deleteModal.style.display = 'none';
    
    // Inicializar event listeners
    initializeEventListeners();
    
    checkSession();
    loadUsers();
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
        if (session.nombre) {
            userNameElements.forEach(el => {
                el.textContent = session.nombre;
            });
        }
        
        if (session.rol) {
            userRoleElement.textContent = session.rol.charAt(0).toUpperCase() + session.rol.slice(1);
        }
        
    } catch (e) {
        console.error('Error al verificar sesión:', e);
        localStorage.removeItem('adminSession');
        window.location.href = 'index.html';
    }
}

// Cargar usuarios desde la API
async function loadUsers() {
    try {
        usersTableBody.innerHTML = '<tr><td colspan="7" class="loading-row">Cargando usuarios...</td></tr>';
        
        const response = await fetch(API_URL, {
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
        
        const usuarios = await response.json();
        
        // Actualizar estadísticas
        updateStats(usuarios);
        
        // Renderizar tabla de usuarios
        renderUsersTable(usuarios);
        
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="loading-row" style="color: var(--error-color);">
                    Error al cargar usuarios. Por favor, intenta nuevamente.
                </td>
            </tr>
        `;
    }
}

// Actualizar estadísticas
function updateStats(usuarios) {
    const total = usuarios.length;
    const active = usuarios.filter(u => u.estado === 'activo').length;
    const clients = usuarios.filter(u => u.rol === 'cliente').length;
    const admins = usuarios.filter(u => u.rol === 'administrador').length;
    
    totalUsersElement.textContent = total;
    activeUsersElement.textContent = active;
    clientsCountElement.textContent = clients;
    adminsCountElement.textContent = admins;
}

// Renderizar tabla de usuarios
function renderUsersTable(usuarios) {
    if (usuarios.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="8" class="loading-row">No hay usuarios registrados</td></tr>';
        return;
    }
    
    usersTableBody.innerHTML = usuarios.map(usuario => {
        const fechaRegistro = new Date(usuario.fecha_registro);
        const fechaFormateada = fechaRegistro.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const estadoAccion = usuario.estado === 'activo' ? 'Desactivar' : 'Activar';
        const estadoIcono = usuario.estado === 'activo' ? '🔒' : '🔓';
        
        return `
            <tr>
                <td>${usuario.id_usuario}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.correo}</td>
                <td>${usuario.telefono || 'N/A'}</td>
                <td><span class="role-badge ${usuario.rol}">${usuario.rol}</span></td>
                <td><span class="status-badge ${usuario.estado}">${usuario.estado}</span></td>
                <td>${fechaFormateada}</td>
                <td class="actions-cell">
                    <button class="btn-action btn-edit" onclick="openEditModal(${usuario.id_usuario})" title="Editar">
                        ✏️ Editar
                    </button>
                    <button class="btn-action btn-toggle" onclick="toggleUserStatus(${usuario.id_usuario}, '${usuario.estado}')" title="${estadoAccion}">
                        ${estadoIcono} ${estadoAccion}
                    </button>
                    <button class="btn-action btn-delete" onclick="openDeleteModal(${usuario.id_usuario}, '${usuario.nombre}')" title="Eliminar">
                        🗑️ Eliminar
                    </button>
                </td>
            </tr>
        `;
    }).join('');
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
    
    // Botón de actualizar
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            loadUsers();
            // Animación de rotación
            refreshButton.style.transform = 'rotate(360deg)';
            refreshButton.style.transition = 'transform 0.5s ease';
            
            setTimeout(() => {
                refreshButton.style.transform = 'rotate(0deg)';
            }, 500);
        });
    }
    
    // Event listeners para el modal de edición
    if (editModal && editUserForm) {
        const closeEditModalBtn = document.getElementById('closeEditModal');
        const cancelEditBtn = document.getElementById('cancelEdit');
        
        if (closeEditModalBtn) {
            closeEditModalBtn.addEventListener('click', closeEditModal);
        }
        
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', closeEditModal);
        }
        
        // Cerrar modal al hacer click fuera
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
        
        // Guardar cambios del usuario
        editUserForm.addEventListener('submit', handleEditUserSubmitAsync);
    }
    
    // Event listeners para el modal de eliminación
    if (deleteModal) {
        const closeDeleteModalBtn = document.getElementById('closeDeleteModal');
        const cancelDeleteBtn = document.getElementById('cancelDelete');
        const confirmDeleteBtn = document.getElementById('confirmDelete');
        
        if (closeDeleteModalBtn) {
            closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
        }
        
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', closeDeleteModal);
        }
        
        // Cerrar modal al hacer click fuera
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                closeDeleteModal();
            }
        });
        
        // Confirmar eliminación
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', handleDeleteUser);
        }
    }
}

// Actualizar automáticamente cada 5 minutos
setInterval(() => {
    loadUsers();
}, 5 * 60 * 1000);

// Verificar sesión periódicamente (cada minuto)
setInterval(() => {
    checkSession();
}, 60 * 1000);

// ==================== FUNCIONES DE GESTIÓN DE USUARIOS ====================

// Abrir modal de edición
window.openEditModal = async function(userId) {
    try {
        // Obtener datos del usuario
        const response = await fetch(`${API_URL}/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar datos del usuario');
        }
        
        const usuario = await response.json();
        
        // Llenar el formulario
        document.getElementById('editUserId').value = usuario.id_usuario;
        document.getElementById('editNombre').value = usuario.nombre || '';
        document.getElementById('editCorreo').value = usuario.correo || '';
        document.getElementById('editTelefono').value = usuario.telefono || '';
        document.getElementById('editDireccion').value = usuario.direccion || '';
        document.getElementById('editRol').value = usuario.rol || 'cliente';
        document.getElementById('editEstado').value = usuario.estado || 'activo';
        
        // Limpiar mensajes de error
        hideEditError();
        
        // Mostrar modal
        editModal.style.display = 'flex';
        currentUserId = userId;
        
    } catch (error) {
        console.error('Error al abrir modal de edición:', error);
        showEditError('Error al cargar los datos del usuario');
    }
};

// Cerrar modal de edición
function closeEditModal() {
    editModal.style.display = 'none';
    editUserForm.reset();
    hideEditError();
    currentUserId = null;
}

// Guardar cambios del usuario
async function handleEditUserSubmitAsync(e) {
    e.preventDefault();
    hideEditError();
    
    const userId = document.getElementById('editUserId').value;
    const usuarioData = {
        id_usuario: parseInt(userId),
        nombre: document.getElementById('editNombre').value.trim(),
        correo: document.getElementById('editCorreo').value.trim(),
        telefono: document.getElementById('editTelefono').value.trim(),
        direccion: document.getElementById('editDireccion').value.trim(),
        rol: document.getElementById('editRol').value,
        estado: document.getElementById('editEstado').value,
        // Mantener campos que no se editan
        contrasena: '', // Se mantendrá en el servidor
        foto_perfil: '', // Se mantendrá en el servidor
        fecha_registro: '' // Se mantendrá en el servidor
    };
    
    try {
        // Primero obtener el usuario actual para mantener los campos que no se editan
        const getResponse = await fetch(`${API_URL}/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!getResponse.ok) {
            throw new Error('Error al obtener datos del usuario');
        }
        
        const usuarioActual = await getResponse.json();
        
        // Mantener campos que no se editan
        usuarioData.contrasena = usuarioActual.contrasena || '';
        usuarioData.foto_perfil = usuarioActual.foto_perfil || '';
        usuarioData.fecha_registro = usuarioActual.fecha_registro || '';
        
        // Actualizar usuario
        const response = await fetch(`${API_URL}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit',
            body: JSON.stringify(usuarioData)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
        
        // Cerrar modal y recargar usuarios
        closeEditModal();
        loadUsers();
        showSuccessMessage('Usuario actualizado correctamente');
        
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        showEditError(error.message || 'Error al actualizar el usuario. Por favor, intenta nuevamente.');
    }
}

// Mostrar/ocultar errores en el modal de edición
function showEditError(message) {
    editErrorMessage.textContent = message;
    editErrorMessage.style.display = 'block';
}

function hideEditError() {
    editErrorMessage.textContent = '';
    editErrorMessage.style.display = 'none';
}

// Activar/Desactivar usuario
window.toggleUserStatus = async function(userId, estadoActual) {
    try {
        // Obtener datos del usuario actual
        const getResponse = await fetch(`${API_URL}/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!getResponse.ok) {
            throw new Error('Error al obtener datos del usuario');
        }
        
        const usuario = await getResponse.json();
        
        // Cambiar estado
        usuario.estado = usuario.estado === 'activo' ? 'inactivo' : 'activo';
        
        // Actualizar usuario
        const response = await fetch(`${API_URL}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit',
            body: JSON.stringify(usuario)
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        // Recargar usuarios
        loadUsers();
        showSuccessMessage(`Usuario ${usuario.estado === 'activo' ? 'activado' : 'desactivado'} correctamente`);
        
    } catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        alert('Error al cambiar el estado del usuario. Por favor, intenta nuevamente.');
    }
};

// Abrir modal de confirmación para eliminar
window.openDeleteModal = function(userId, userName) {
    document.getElementById('deleteUserName').textContent = userName;
    deleteModal.style.display = 'flex';
    currentUserId = userId;
};

// Cerrar modal de eliminación
function closeDeleteModal() {
    deleteModal.style.display = 'none';
    currentUserId = null;
}

// Confirmar eliminación
async function handleDeleteUser() {
    if (!currentUserId) return;
    
    try {
        const response = await fetch(`${API_URL}/${currentUserId}`, {
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
        
        // Cerrar modal y recargar usuarios
        closeDeleteModal();
        loadUsers();
        showSuccessMessage('Usuario eliminado correctamente');
        
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar el usuario. Por favor, intenta nuevamente.');
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
            document.body.removeChild(successMsg);
        }, 300);
    }, 3000);
}


