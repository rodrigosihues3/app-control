import { Routes, Route, Navigate } from 'react-router-dom';
import ControlAsistencia from './pages/ControlAsistencia';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import HomeQR from './pages/HomeQR';
import AdminLayout from './layouts/AdminLayout';
import AdminVisitantes from './pages/AdminVisitantes';
import VisitanteHistorial from './pages/VisitanteHistorial';
import AdminUsuarios from './pages/AdminUsuarios';
import MisRegistros from './pages/MisRegistros';

// Componente para proteger rutas (Simple)
const RutaProtegida = ({ children, rolRequerido }) => {
  const token = localStorage.getItem('token');
  const rolUsuario = localStorage.getItem('usuario_rol');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (rolRequerido && rolUsuario !== rolRequerido) {
    // Si intentó entrar a admin pero es visitante, lo mandamos a SU zona
    if (rolUsuario === 'visitante') {
      return <Navigate to="/mis-registros" replace />;
    }
    // Caso contrario, al login
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <div className="min-vh-100 bg-light">
      <Routes>
        {/* 1. HOME: Pantalla Gigante con QR */}
        <Route path="/" element={<HomeQR />} />

        {/* 2. VISTA USUARIO: Formulario móvil */}
        <Route path="/control" element={<ControlAsistencia />} />

        {/* 3. LOGIN */}
        <Route path="/login" element={<AdminLogin />} />

        {/* 4. ZONA VISITANTE (NUEVA RUTA) */}
        <Route path="/mis-registros" element={
          <RutaProtegida>
            <MisRegistros />
          </RutaProtegida>
        } />

        {/* 5. ZONA ADMIN (Rutas Anidadas) */}
        <Route path="/admin" element={
          <RutaProtegida rolRequerido="admin">
            <AdminLayout />
          </RutaProtegida>
        }>
          {/* Redirección por defecto: /admin -> /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" />} />

          {/* Vistas Hijas */}
          <Route path="dashboard" element={<AdminPanel />} />
          {/* --- NUEVAS RUTAS --- */}
          <Route path="visitantes" element={<AdminVisitantes />} />
          <Route path="visitantes/:id/historial" element={<VisitanteHistorial />} />

          <Route path="usuarios" element={<AdminUsuarios />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;