// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Rutas corregidas: usa './pages/...' ya que pages/ está DENTRO de src/
import PrincipalPage from './pages/PrincipalPage'; 
import ReviewsPage from './pages/ReviewsPage';
import LoginPage from './pages/LoginPage'; 

import './App.css'; 

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navegación */}
        <nav style={{ padding: '10px 20px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
          <Link to="/" style={{ marginRight: '15px' }}>Login/Registro</Link>
          <Link to="/principal" style={{ marginRight: '15px' }}>Vista Principal (Mapa)</Link>
          <Link to="/reviews">Vista Reseñas</Link>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/principal" element={<PrincipalPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;