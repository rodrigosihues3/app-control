import { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getHistorialPorId } from '../services/api';

export default function VisitanteHistorial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistorialPorId(id).then(data => {
      setRegistros(data);
      setLoading(false);
    });
  }, [id]);

  return (
    <Container className="py-4">
      <Button variant="outline-secondary" className="mb-3" onClick={() => navigate(-1)}>
        &larr; Volver
      </Button>

      <h3 className="mb-4">Historial de Movimientos</h3>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {!loading && registros.length > 0 ? (
                registros.map(r => (
                  <tr key={r.id}>
                    <td>{new Date(r.fecha_hora).toLocaleDateString()}</td>
                    <td>{new Date(r.fecha_hora).toLocaleTimeString()}</td>
                    <td>
                      <Badge bg={r.tipo === 'INGRESO' ? 'success' : 'danger'}>{r.tipo}</Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="text-center py-4">No hay registros.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}