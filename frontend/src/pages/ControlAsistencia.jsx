import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { buscarVisitante, registrarAsistencia } from '../services/api';

export default function ControlAsistencia() {
  // Estados del Formulario
  const [dni, setDni] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [tipo, setTipo] = useState('INGRESO');

  // Estados de Control
  const [camposHabilitados, setCamposHabilitados] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false); // Estado clave para el botón
  const [mensaje, setMensaje] = useState(null);
  const [horaActual, setHoraActual] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setHoraActual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- NUEVO: Manejador estricto para el DNI ---
  const handleDniChange = (e) => {
    const valor = e.target.value;
    // Expresión Regular: /^\d*$/ significa "Solo dígitos del inicio al fin"
    // También validamos que no pase de 8 caracteres
    if (/^\d*$/.test(valor) && valor.length <= 8) {
      setDni(valor);
    }
  };

  // Función 1: Buscar DNI
  const handleBuscar = async () => {
    if (dni.length !== 8) { // Validación estricta de longitud
      setMensaje({ type: 'warning', text: 'El DNI debe tener exactamente 8 dígitos.' });
      return;
    }

    setLoadingSearch(true);
    setMensaje(null);

    try {
      const res = await buscarVisitante(dni);

      if (res.encontrado) {
        const datos = res.data;
        setNombres(datos.nombres || '');
        setApellidos(datos.apellidos || '');

        // Si falta nombre o apellido, permitimos editar
        if (!datos.nombres || datos.nombres.trim() === '' || !datos.apellidos || datos.apellidos.trim() === '') {
          setCamposHabilitados(true);
          setMensaje({ type: 'warning', text: 'Visitante encontrado, pero faltan datos. Por favor complételos.' });
        } else {
          setCamposHabilitados(false);
          setMensaje({ type: 'success', text: 'Visitante encontrado. Confirme el tipo de registro.' });
        }

      } else {
        setNombres('');
        setApellidos('');
        setCamposHabilitados(true);
        setMensaje({ type: 'info', text: 'DNI no registrado. Por favor ingrese sus datos manualmente.' });
      }
    } catch (error) {
      setMensaje({ type: 'danger', text: 'Error de conexión con el servidor.' });
    } finally {
      setLoadingSearch(false);
    }
  };

  // Función 2: Registrar Control
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación final antes de enviar
    if (dni.length !== 8) {
      setMensaje({ type: 'danger', text: 'El DNI es inválido.' });
      return;
    }
    if (!nombres || !apellidos) {
      setMensaje({ type: 'danger', text: 'Por favor complete los nombres y apellidos.' });
      return;
    }

    // 1. Activamos el bloqueo del botón INMEDIATAMENTE
    setLoadingSubmit(true);

    try {
      await registrarAsistencia({
        dni,
        nombres,
        apellidos,
        tipo
      });

      setMensaje({ type: 'success', text: `¡${tipo} registrado correctamente a las ${horaActual.toLocaleTimeString()}!` });

      // Limpiar formulario después de 3 segundos
      setTimeout(() => {
        setDni('');
        setNombres('');
        setApellidos('');
        setCamposHabilitados(false);
        setTipo('INGRESO');
        setMensaje(null);
      }, 3000);

    } catch (error) {
      setMensaje({ type: 'danger', text: 'Error al guardar el registro.' });
    } finally {
      // 2. Desbloqueamos el botón solo cuando todo terminó
      setLoadingSubmit(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 py-4">
      <Card className="shadow-lg w-100" style={{ maxWidth: '500px' }}>
        <Card.Header className="bg-primary text-white text-center py-3">
          <h4 className="mb-0 fw-bold">Control de Asistencia</h4>
          <small>Centro de Asesorías</small>
        </Card.Header>

        <Card.Body className="p-4">
          {mensaje && <Alert variant={mensaje.type} className="mb-4">{mensaje.text}</Alert>}

          <Form onSubmit={handleSubmit}>

            {/* SECCIÓN 1: DNI Y BÚSQUEDA */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">DNI del Visitante</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text" // Cambiado a TEXT para controlar mejor
                  inputMode="numeric" // Abre teclado numérico en celulares
                  placeholder="Ingrese DNI"
                  value={dni}
                  onChange={handleDniChange} // Usamos el nuevo manejador
                  maxLength={8} // Límite HTML
                  autoFocus
                />
                <Button
                  variant="secondary"
                  onClick={handleBuscar}
                  // Deshabilitado si busca O si el DNI no está completo
                  disabled={loadingSearch || dni.length !== 8}
                  style={{ minWidth: '100px' }}
                >
                  {loadingSearch ? <Spinner size="sm" /> : 'Buscar'}
                </Button>
              </div>
            </Form.Group>

            {/* SECCIÓN 2: DATOS PERSONALES */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombres</Form.Label>
                  <Form.Control
                    type="text"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    readOnly={!camposHabilitados}
                    className={!camposHabilitados ? 'bg-light' : ''}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellidos</Form.Label>
                  <Form.Control
                    type="text"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    readOnly={!camposHabilitados}
                    className={!camposHabilitados ? 'bg-light' : ''}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* SECCIÓN 3: TIPO DE REGISTRO */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold d-block">Tipo de Registro</Form.Label>
              <div className="d-flex justify-content-around bg-light p-2 rounded border">
                <Form.Check
                  type="radio"
                  id="radio-ingreso"
                  label="INGRESO"
                  name="tipoRegistro"
                  value="INGRESO"
                  checked={tipo === 'INGRESO'}
                  onChange={(e) => setTipo(e.target.value)}
                  className="fw-bold text-success"
                />
                <Form.Check
                  type="radio"
                  id="radio-salida"
                  label="SALIDA"
                  name="tipoRegistro"
                  value="SALIDA"
                  checked={tipo === 'SALIDA'}
                  onChange={(e) => setTipo(e.target.value)}
                  className="fw-bold text-danger"
                />
              </div>
            </Form.Group>

            {/* SECCIÓN 4: HORA Y BOTÓN FINAL */}
            <div className="text-center mb-4">
              <span className="text-muted">Hora de registro: </span>
              <Badge bg="dark" className="fs-6">
                {horaActual.toLocaleTimeString()}
              </Badge>
            </div>

            <Button
              variant="primary"
              type="submit"
              size="lg"
              className="w-100 fw-bold"
              // AQUÍ LA SOLUCIÓN: Deshabilitado si está cargando
              disabled={loadingSubmit}
            >
              {loadingSubmit ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Registrando...
                </>
              ) : (
                'REGISTRAR CONTROL'
              )}
            </Button>

          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}