import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Container, Row, Col, Card, Table, Badge, Button, ButtonGroup } from 'react-bootstrap';
import { getRegistros } from '../services/api';

export default function AdminPanel() {
  const [registros, setRegistros] = useState([]);

  // Estados de Paginación
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // URL del QR
  const urlRegistro = `${window.location.origin}/control`;

  // Carga inicial y cuando cambia la página
  useEffect(() => {
    const cargarDatos = async (paginaSolicitada) => {
      try {
        const data = await getRegistros(paginaSolicitada, 15);
        setRegistros(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        // No seteamos 'page' aquí para evitar bucles, ya sabemos que es 'paginaSolicitada'
      } catch (error) {
        console.error("Error cargando registros:", error);
      }
    };

    cargarDatos(page);

    // Configurar intervalo solo si estamos en la página 0 (En Vivo)
    let intervalo;
    if (page === 0) {
      intervalo = setInterval(() => cargarDatos(0), 5000);
    }

    // Limpiar intervalo al desmontar o cambiar de página
    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [page]); // Se ejecuta cada vez que cambiamos de página

  // Manejadores de botones
  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  return (
    <Container fluid className="p-4">
      <Row>
        {/* Columna QR (Igual que antes) */}
        <Col md={4} lg={3} className="mb-4 h-100">
          {/* ... (El código de tu tarjeta QR se mantiene igual) ... */}
          <Card className="text-center shadow-sm h-100">
            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
              <h4 className="mb-3">Escanear para Registrar</h4>
              <div className="p-3 border rounded bg-white">
                <QRCode value={urlRegistro} size={200} />
              </div>
              <Badge bg="light" text="dark" className="mt-2">
                <a href={urlRegistro}>{urlRegistro}</a>
              </Badge>
            </Card.Body>
          </Card>
        </Col>

        {/* Columna Tabla (Actualizada con Paginación) */}
        <Col md={8} lg={9}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center">
              <span>Historial de Registros</span>
              <Badge bg="info" text="dark">Total: {totalElements}</Badge>
            </Card.Header>

            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Visitante</th>
                    <th>DNI</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.length > 0 ? (
                    registros.map((reg) => (
                      <tr key={reg.id}>
                        <td className="text-muted small">
                          {new Date(reg.fecha_hora).toLocaleDateString()}
                        </td>
                        <td className="fw-bold text-secondary">
                          {new Date(reg.fecha_hora).toLocaleTimeString()}
                        </td>
                        <td>
                          {reg.Visitante ? `${reg.Visitante.nombres} ${reg.Visitante.apellidos}` : 'Desconocido'}
                        </td>
                        <td>{reg.Visitante?.dni || '-'}</td>
                        <td>
                          <Badge bg={reg.tipo === 'INGRESO' ? 'success' : 'danger'}>
                            {reg.tipo}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No hay registros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>

            {/* --- PAGINADOR --- */}
            <Card.Footer className="bg-white d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Página {page + 1} de {totalPages === 0 ? 1 : totalPages}
              </small>

              <ButtonGroup>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handlePrev}
                  disabled={page === 0}
                >
                  &laquo; Anterior
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleNext}
                  disabled={page >= totalPages - 1}
                >
                  Siguiente &raquo;
                </Button>
              </ButtonGroup>
            </Card.Footer>

          </Card>
        </Col>
      </Row>
    </Container>
  );
}