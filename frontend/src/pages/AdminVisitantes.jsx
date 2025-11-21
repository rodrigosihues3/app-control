import { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, InputGroup, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getVisitantes, createVisitante, updateVisitante, deleteVisitante } from '../services/api';

export default function AdminVisitantes() {
  const [visitantes, setVisitantes] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // --- 1. ESTADO PARA CONTROLAR LA RECARGA ---
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal Estado
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ dni: '', nombres: '', apellidos: '' });

  // --- 2. USEEFFECT AUTOCONTENIDO (La Solución) ---
  useEffect(() => {
    // Definimos la función async DENTRO del efecto.
    // Esto aísla la lógica y elimina las advertencias de dependencias externas.
    const cargarDatos = async () => {
      try {
        const data = await getVisitantes(page, search);
        setVisitantes(data.content);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error(error);
      }
    };

    cargarDatos();
  }, [page, search, refreshTrigger]);

  // --- 3. FUNCIÓN PARA RECARGAR MANUALMENTE ---
  const recargar = () => setRefreshTrigger(prev => prev + 1);

  // Manejo del Modal
  const handleOpen = (visitante = null) => {
    if (visitante) {
      setEditingId(visitante.id);
      setFormData({ dni: visitante.dni, nombres: visitante.nombres, apellidos: visitante.apellidos });
    } else {
      setEditingId(null);
      setFormData({ dni: '', nombres: '', apellidos: '' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateVisitante(editingId, formData);
      } else {
        await createVisitante(formData);
      }
      setShowModal(false);
      recargar(); // <--- Usamos nuestra función simple para recargar
    } catch (error) {
      alert('Error al guardar (Verifique DNI duplicado)');
      console.log("Error: ", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que desea eliminar a este visitante? Se borrará su historial.')) {
      await deleteVisitante(id);
      recargar(); // <--- Recargamos la tabla
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">Gestión de Visitantes</h2>
        <Button variant="success" onClick={() => handleOpen()}>+ Nuevo Visitante</Button>
      </div>

      {/* Buscador */}
      <InputGroup className="mb-4 shadow-sm">
        <Form.Control
          placeholder="Buscar por DNI, Nombre o Apellido..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
      </InputGroup>

      {/* Tabla */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>DNI</th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visitantes.map((v) => (
                <tr key={v.id}>
                  <td><Badge bg="secondary">{v.dni}</Badge></td>
                  <td>{v.nombres}</td>
                  <td>{v.apellidos}</td>
                  <td className="text-end">
                    <Button variant="outline-info" size="sm" className="me-2"
                      onClick={() => navigate(`/admin/visitantes/${v.id}/historial`)}>
                      📅 Historial
                    </Button>
                    <Button variant="outline-warning" size="sm" className="me-2"
                      onClick={() => handleOpen(v)}>
                      ✏️
                    </Button>
                    <Button variant="outline-danger" size="sm"
                      onClick={() => handleDelete(v.id)}>
                      🗑️
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Paginación Básica */}
      <div className="d-flex justify-content-between mt-3 align-items-center">
        <span className="text-muted">Página {page + 1} de {totalPages || 1}</span>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2"
            disabled={page === 0} onClick={() => setPage(page - 1)}> Anterior </Button>
          <Button variant="outline-secondary" size="sm"
            disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}> Siguiente </Button>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Editar' : 'Nuevo'} Visitante</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>DNI</Form.Label>
              <Form.Control type="number" value={formData.dni}
                onChange={e => setFormData({ ...formData, dni: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombres</Form.Label>
              <Form.Control type="text" value={formData.nombres}
                onChange={e => setFormData({ ...formData, nombres: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control type="text" value={formData.apellidos}
                onChange={e => setFormData({ ...formData, apellidos: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}