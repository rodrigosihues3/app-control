import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/api';

export default function AdminLogin() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await loginAdmin({ usuario, password });

      // Guardamos el token y el nombre
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario_nombre', data.usuario.nombre);
      localStorage.setItem('usuario_rol', data.rol);

      // Redirigimos al panel
      if (data.rol === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/mis-registros'); // Nueva ruta para visitantes
      }
    } catch (err) {
      setError('Credenciales incorrectas o usuario no registrado.');
      console.log("Error: ", err)
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
      <Card className="p-4 shadow-lg" style={{ width: '400px' }}>
        <Card.Body>
          <h3 className="text-center mb-4 fw-bold">Accede a tu historial</h3>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                autoFocus
                placeholder="Ingresa tu DNI"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={password}
                placeholder="Es tu DNI por defecto"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 btn-lg">
              Ingresar
            </Button>
            <div className="mt-3 text-center text-muted small">
              ¿Quieres volver al inicio? <a href="/">Clic aquí</a>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}