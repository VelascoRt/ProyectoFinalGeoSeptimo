import React, { useState } from 'react';
import UserService from '../services/UserService'; // Importar el nuevo servicio
import { useNavigate } from 'react-router-dom'; // Para redireccionar después del login


function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ 
        username: '', // Usamos username como en tu modelo
        password: '', 
        // El modelo actual solo usa username y password, 
        // si quieres añadir 'nombre', debes actualizar el modelo y servicio backend
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (isLogin) {
                // Lógica de Login:
                await UserService.login(formData.username, formData.password);
                console.log('Login exitoso.');
                // Redirigir a la Vista Principal
                navigate('/principal'); 
            } else {
                // Lógica de Registro:
                await UserService.register({ 
                    username: formData.username, 
                    password: formData.password 
                });
                alert('Registro exitoso. ¡Inicia sesión!');
                setIsLogin(true); // Cambia a la vista de login
            }
        } catch (error) {
            console.error('Error de autenticación:', error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Nombre de Usuario:</label>
                    <input 
                        type="text" 
                        name="username" 
                        value={formData.username}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <label>Contraseña:</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                
                <button type="submit" style={{ padding: '10px 15px', width: '100%', backgroundColor: isLogin ? '#007bff' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {isLogin ? 'Ingresar' : 'Registrar'}
                </button>
            </form>
            
            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <button 
                    type="button" 
                    onClick={() => setIsLogin(!isLogin)}
                    style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
                </button>
            </p>
        </div>
    );
}

export default LoginPage;