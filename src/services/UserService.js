import APIService from './APIService'; 

const USER_ENDPOINT = '/user';

class UserService {
    
    // REGISTRO
    async register(data) {
        // Llama a POST /user/
        return APIService.request(USER_ENDPOINT, 'POST', data);
    }

    // LOGIN
    async login(username, password) {
        // Llama a POST /user/login
        const data = await APIService.request(`${USER_ENDPOINT}/login`, 'POST', { username, password });
        
        // Guarda el token en el almacenamiento local al iniciar sesión
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data.user;
    }

    // LOGOUT
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Obtener información del usuario actual (útil para saber quién está logueado)
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }
}

export default new UserService();