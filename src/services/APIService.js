// src/services/APIService.js

// Ajusta el puerto (3001) si tu API corre en otro puerto
const BASE_URL = 'http://localhost:3001'; 

class APIService {
    
    async request(endpoint, method = 'GET', data = null) {
        const url = `${BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            // No establecemos 'credentials: include' aquí, ya que el backend lo maneja
        };

        const config = {
            method: method,
            headers: headers,
            body: data ? JSON.stringify(data) : null,
        };

        try {
            const response = await fetch(url, config);
            
            if (response.status === 204) {
                return { message: 'Operación exitosa' };
            }

            const json = await response.json();

            if (!response.ok) {
                // El error de la API se captura aquí y se lanza con su mensaje
                throw new Error(json.message || `Error en la petición: ${response.status}`);
            }

            return json;

        } catch (error) {
            console.error('API Service Error:', error);
            // El error 'Failed to fetch' se lanza aquí.
            throw new Error(error.message || 'Ocurrió un error al conectar con el servidor.');
        }
    }
}

export default new APIService();