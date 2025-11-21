import { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, Modal, Badge } from 'react-bootstrap';
import { getAdmins, createAdmin, deleteAdmin } from '../services/api';

export default function AdminUsuarios() {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ usuario: '', password: '', nombre: '' });

  // Obtenemos el nombre del admin actual para evitar auto-eliminación
  const currentAdminName = localStorage.getItem('admin_nombre');

  const cargar = async () => {
    try {
      const data = await getAdmins();
      setAdmins(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleSave = async () => {
    try {
      await createAdmin(formData);
      setShowModal(false);
      setFormData({ usuario: '', password: '', nombre: '' }); // Limpiar form
      cargar();
      alert('Administrador creado correctamente');
    } catch (error) {
      alert('Error: El usuario ya existe o datos inválidos');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que desea eliminar a este administrador?')) {
      try {
        await deleteAdmin(id);
        cargar();
      } catch (error) {
        alert('Error al eliminar');
      }
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">Gestión de Administradores</h2>
        <Button variant="success" onClick={() => setShowModal(true)}>+ Nuevo Admin</Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Usuario</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => {
                // Lógica: ¿Es este el usuario actual?
                const esYoMismo = admin.nombre === currentAdminName;

                return (
                  <tr key={admin.id} className={esYoMismo ? "table-active" : ""}>
                    <td>{admin.id}</td>
                    <td className="fw-bold">
                      {admin.nombre} {esYoMismo && <Badge bg="info" className="ms-2">Tú</Badge>}
                    </td>
                    <td>{admin.usuario}</td>
                    <td className="text-end">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        disabled={esYoMismo} // Bloqueamos si es el mismo usuario
                        onClick={() => handleDelete(admin.id)}
                        title={esYoMismo ? "No puedes eliminarte a ti mismo" : "Eliminar"}
                      >
                        🗑️ Eliminar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal Crear Admin */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>Nuevo Administrador</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control type="text" placeholder="Ej. Juan Pérez"
                onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Usuario (Login)</Form.Label>
              <Form.Control type="text" placeholder="Ej. jperez"
                onChange={e => setFormData({ ...formData, usuario: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" placeholder="*******"
                onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Crear Admin</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}