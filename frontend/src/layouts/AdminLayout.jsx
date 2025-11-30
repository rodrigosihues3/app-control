import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminNombre = localStorage.getItem('admin_nombre') || 'Admin';

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_nombre');
    navigate('/login');
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* --- NAVBAR EXCLUSIVO DE ADMIN --- */}
      <Navbar bg="white" expand="lg" className="shadow-sm mb-4">
        <Container fluid>
          <Navbar.Brand as={Link} to="/admin/dashboard" className="fw-bold text-primary">
            Panel Admin
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="admin-nav" />
          <Navbar.Collapse id="admin-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/admin/dashboard" active={location.pathname.includes('dashboard')}>
                Monitor En Vivo
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/visitantes" active={location.pathname.includes('visitantes')}>
                Visitantes
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/usuarios" active={location.pathname.includes('usuarios')}>
                Admins
              </Nav.Link>
              <div className="vr mx-2 d-none d-lg-block"></div> {/* Línea vertical separadora de Bootstrap */}

              <Nav.Link as={Link} to="/" className="text-secondary">
                <i className="bi bi-qr-code-scan me-1"></i> Ir al inicio (QR)
              </Nav.Link>
            </Nav>
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted">Hola, <strong>{adminNombre}</strong></span>
              <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                Salir
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* --- AQUÍ SE RENDERIZAN LAS VISTAS HIJAS --- */}
      <Container fluid className="px-4">
        <Outlet />
      </Container>
    </div>
  );
}