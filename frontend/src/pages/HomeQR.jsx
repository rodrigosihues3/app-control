import QRCode from 'react-qr-code';
import { Container, Card, Badge } from 'react-bootstrap';

export default function HomeQR() {
  // La URL que los usuarios abrirán
  const urlRegistro = `${window.location.origin}/control`;

  return (
    <Container fluid className="vh-100 d-flex justify-content-center align-items-center bg-dark">
      <Card className="text-center shadow-lg p-5" style={{ maxWidth: '600px', width: '100%' }}>
        <Card.Body>
          <h1 className="display-4 text-primary fw-bold mb-4">Registro de Asistencia</h1>
          <p className="lead text-muted mb-4">
            Escanea el código QR para registrar tu Ingreso o Salida.
          </p>

          <div className="d-flex justify-content-center my-4">
            <div className="p-3 border rounded bg-white shadow-sm">
              <QRCode value={urlRegistro} size={300} />
            </div>
          </div>

          <div className="mt-5 text-muted small">
            ¿No puedes escanear el código? <a href="/control">Ingresa aquí</a>
          </div>
          <div className="mt-2 text-muted small">
            ¿Eres administrador? <a href="/admin">Ingresa al Panel</a>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}