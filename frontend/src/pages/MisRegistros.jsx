import { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getMisRegistros } from '../services/api';

export default function MisRegistros() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const nombreUsuario = localStorage.getItem('usuario_nombre');

  useEffect(() => {
    cargarRegistros();
  }, [page]);

  const cargarRegistros = async () => {
    setLoading(true);
    try {
      // 2. USAMOS LA FUNCIÓN DEL SERVICIO
      // Nota: getMisRegistros ya devuelve "response.data", no el objeto axios completo.
      const data = await getMisRegistros(page, 20);

      // 3. ACCEDEMOS DIRECTAMENTE A LAS PROPIEDADES
      setRegistros(data.registros);
      setTotalPages(data.totalPages);

    } catch (error) {
      console.error("Error cargando historial", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_nombre');
    localStorage.removeItem('usuario_rol');
    navigate('/');
  };

  // Función auxiliar para formatear fecha bonita (Ej: "Lunes, 22 de Diciembre")
  const formatDateHeader = (fechaISO) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaISO).toLocaleDateString('es-ES', options);
  };

  // Función para formatear hora (Ej: "08:30 AM")
  const formatTime = (fechaISO) => {
    return new Date(fechaISO).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-vh-100 bg-light">
      <div className="bg-white shadow-sm p-3 mb-4 d-flex justify-content-between align-items-center">
        <h5 className="m-0 text-primary">Hola <strong>{nombreUsuario}</strong></h5>
        <Button variant="outline-danger" size="sm" onClick={handleLogout}>Cerrar Sesión</Button>
      </div>

      <Container>
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" /></div>
        ) : (
          <>
            <div className="d-flex justify-content-center gap-2 my-4">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <span className="align-self-center">Página {page} de {totalPages}</span>
              <Button
                variant="secondary"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </Button>
            </div>

            {registros.length === 0 ? (
              <Alert variant="info">No tienes registros de asistencia aún.</Alert>
            ) : (
              <div className="d-flex flex-column gap-3">
                {registros.map((reg, index) => {
                  const fechaActual = new Date(reg.fecha_hora).toDateString();
                  const fechaAnterior = index > 0 ? new Date(registros[index - 1].fecha_hora).toDateString() : null;
                  const esNuevoDia = fechaActual !== fechaAnterior;

                  return (
                    <div key={reg.id}>
                      {esNuevoDia && (
                        <div className="mt-4 mb-2">
                          <h6 className="text-muted text-uppercase fw-bold border-bottom pb-2">
                            📅 {formatDateHeader(reg.fecha_hora)}
                          </h6>
                        </div>
                      )}

                      <Card className="border-0 shadow-sm mb-2">
                        <Card.Body className="d-flex justify-content-between align-items-center py-2">
                          <div>
                            <span className="fs-5 fw-bold me-2">{formatTime(reg.fecha_hora)}</span>
                            {/* Pequeña mejora visual: mostrar también la fecha corta si se desea */}
                          </div>

                          <Badge
                            bg={reg.tipo === 'ENTRADA' || reg.tipo === 'INGRESO' ? 'success' : 'danger'}
                            pill
                            className="px-3 py-2"
                          >
                            {reg.tipo.toUpperCase()}
                          </Badge>
                        </Card.Body>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}