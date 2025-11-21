import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/api';

export default function AdminLogin() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await loginAdmin({ usuario, password });

      // Guardamos el token y el nombre
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_nombre', data.admin.nombre);

      // Redirigimos al panel
      navigate('/admin');

    } catch (err) {
      setError('Credenciales incorrectas o error de conexión.');
      console.log("Error: ", err)
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
      <Card className="p-4 shadow-lg" style={{ width: '400px' }}>
        <Card.Body>
          <h3 className="text-center mb-4 fw-bold">Acceso Administrativo</h3>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                autoFocus
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
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 btn-lg">
              Ingresar
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}