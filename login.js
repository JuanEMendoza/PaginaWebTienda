// API endpoint
const API_URL = 'https://apijhon.onrender.com/api/usuarios';

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const loginButton = document.getElementById('loginButton');
const errorMessage = document.getElementById('errorMessage');
const buttonLoader = document.getElementById('buttonLoader');

// Verificar si ya hay una sesión activa
window.addEventListener('DOMContentLoaded', () => {
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
        try {
            const session = JSON.parse(adminSession);
            // Verificar que la sesión no haya expirado (24 horas)
            if (session.timestamp && Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
                window.location.href = 'dashboard.html';
                return;
            } else {
                // Sesión expirada
                localStorage.removeItem('adminSession');
            }
        } catch (e) {
            localStorage.removeItem('adminSession');
        }
    }
});

// Toggle mostrar/ocultar contraseña
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    const eyeIcon = togglePasswordBtn.querySelector('.eye-icon');
    eyeIcon.textContent = type === 'password' ? '👁️' : '🙈';
});

// Manejar el envío del formulario
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validación básica
    if (!email || !password) {
        showError('Por favor, completa todos los campos');
        return;
    }
    
    // Mostrar estado de carga
    setLoadingState(true);
    hideError();
    
    try {
        // Obtener todos los usuarios de la API
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
        
        // Buscar el usuario administrador con las credenciales proporcionadas
        const admin = usuarios.find(usuario => 
            usuario.correo === email && 
            usuario.contrasena === password && 
            usuario.rol === 'administrador' &&
            usuario.estado === 'activo'
        );
        
        if (admin) {
            // Login exitoso
            const sessionData = {
                id_usuario: admin.id_usuario,
                nombre: admin.nombre,
                correo: admin.correo,
                rol: admin.rol,
                timestamp: Date.now()
            };
            
            // Guardar sesión en localStorage
            localStorage.setItem('adminSession', JSON.stringify(sessionData));
            
            // Redirigir al dashboard después de un breve delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
            
        } else {
            // Credenciales incorrectas
            showError('Credenciales incorrectas. Verifica tu correo y contraseña.');
            setLoadingState(false);
            // Limpiar campo de contraseña
            passwordInput.value = '';
            passwordInput.focus();
        }
        
    } catch (error) {
        console.error('Error en el login:', error);
        
        // Manejo de errores más específico
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showError('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
        } else if (error.message.includes('CORS')) {
            showError('Error de configuración del servidor. Por favor, contacta al administrador.');
        } else {
            showError('Error al iniciar sesión. Por favor, intenta nuevamente.');
        }
        
        setLoadingState(false);
    }
});

// Función para mostrar errores
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    
    // Ocultar el error después de 5 segundos
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Función para ocultar errores
function hideError() {
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
}

// Función para cambiar el estado de carga
function setLoadingState(loading) {
    if (loading) {
        loginButton.disabled = true;
        loginButton.classList.add('loading');
    } else {
        loginButton.disabled = false;
        loginButton.classList.remove('loading');
    }
}

// Prevenir envío del formulario con Enter en campos individuales
emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        passwordInput.focus();
    }
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginForm.dispatchEvent(new Event('submit'));
    }
});


