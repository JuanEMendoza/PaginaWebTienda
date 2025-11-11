// API endpoint
const API_URL = 'https://apijhon.onrender.com/api/usuarios';

// Elementos del DOM
const userNameElements = document.querySelectorAll('#userName, #welcomeName');
const userRoleElement = document.getElementById('userRole');
const logoutButton = document.getElementById('logoutButton');
const refreshButton = document.getElementById('refreshButton');
const usersTableBody = document.getElementById('usersTableBody');
const totalUsersElement = document.getElementById('totalUsers');
const activeUsersElement = document.getElementById('activeUsers');
const clientsCountElement = document.getElementById('clientsCount');
const adminsCountElement = document.getElementById('adminsCount');

// Verificar sesión al cargar la página
window.addEventListener('DOMContentLoaded', () => {
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
                <td colspan="7" class="loading-row" style="color: var(--error-color);">
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
        usersTableBody.innerHTML = '<tr><td colspan="7" class="loading-row">No hay usuarios registrados</td></tr>';
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
        
        return `
            <tr>
                <td>${usuario.id_usuario}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.correo}</td>
                <td>${usuario.telefono || 'N/A'}</td>
                <td><span class="role-badge ${usuario.rol}">${usuario.rol}</span></td>
                <td><span class="status-badge ${usuario.estado}">${usuario.estado}</span></td>
                <td>${fechaFormateada}</td>
            </tr>
        `;
    }).join('');
}

// Botón de cerrar sesión
logoutButton.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('adminSession');
        window.location.href = 'index.html';
    }
});

// Botón de actualizar
refreshButton.addEventListener('click', () => {
    loadUsers();
    // Animación de rotación
    refreshButton.style.transform = 'rotate(360deg)';
    refreshButton.style.transition = 'transform 0.5s ease';
    
    setTimeout(() => {
        refreshButton.style.transform = 'rotate(0deg)';
    }, 500);
});

// Actualizar automáticamente cada 5 minutos
setInterval(() => {
    loadUsers();
}, 5 * 60 * 1000);

// Verificar sesión periódicamente (cada minuto)
setInterval(() => {
    checkSession();
}, 60 * 1000);

