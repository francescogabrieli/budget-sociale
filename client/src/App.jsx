import React, { useEffect, useState } from 'react';
import { Container, Navbar, Button, Row, Col, Modal, Spinner, Alert } from 'react-bootstrap';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/Auth';
import API from '../API.mjs';
import FeedbackContext from '../contexts/FeedbackContext.mjs';
import { Role } from '../../server/models/User.mjs';
import Phase0 from '../components/Phase0';
import Phase1 from '../components/Phase1';
import Phase2 from '../components/Phase2';
import Phase3 from '../components/Phase3';
import AddProposalPage from '../components/AddProposalPage';
import EditProposalPage from '../components/EditProposalPage';
import ViewVotedProposalsPage from '../components/ViewVotedProposalsPage';
import UtentiAnonimiPages from '../components/UtentiAnonimiPages';
import { PhaseProvider, usePhase } from '../contexts/PhaseContext';
import { FaInfoCircle } from 'react-icons/fa';

const piggyBankIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-piggy-bank-fill" viewBox="0 0 16 16">
    <path d="M7.964 1.527c-2.977 0-5.571 1.704-6.32 4.125h-.55A1 1 0 0 0 .11 6.824l.254 1.46a1.5 1.5 0 0 0 1.478 1.243h.263c.3.513.688.978 1.145 1.382l-.729 2.477a.5.5 0 0 0 .48.641h2a.5.5 0 0 0 .471-.332l.482-1.351c.635.173 1.31.267 2.011.267.707 0 1.388-.095 2.028-.272l.543 1.372a.5.5 0 0 0 .465.316h2a.5.5 0 0 0 .478-.645l-.761-2.506C13.81 9.895 14.5 8.559 14.5 7.069q0-.218-.02-.431c.261-.11.508-.266.705-.444.315.306.815.306.815-.417 0 .223-.5.223-.461-.026a1 1 0 0 0 .09-.255.7.7 0 0 0-.202-.645.58.58 0 0 0-.707-.098.74.74 0 0 0-.375.562c-.024.243.082.48.32.654a2 2 0 0 1-.259.153c-.534-2.664-3.284-4.595-6.442-4.595m7.173 3.876a.6.6 0 0 1-.098.21l-.044-.025c-.146-.09-.157-.175-.152-.223a.24.24 0 0 1 .117-.173c.049-.027.08-.021.113.012a.2.2 0 0 1 .064.199m-8.999-.65a.5.5 0 1 1-.276-.96A7.6 7.6 0 0 1 7.964 3.5c.763 0 1.497.11 2.18.315a.5.5 0 1 1-.287.958A6.6 6.6 0 0 0 7.964 4.5c-.64 0-1.255.09-1.826.254ZM5 6.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0"/>
  </svg>
);

function App() {
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();
  const { currentPhase, fetchPhase } = usePhase();

  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [loading, setLoading] = useState(true);

  //Operazioni da eseguire quando il componente viene montato
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await API.getUserInfo();
        setUser(user);
        setLoggedIn(true);
        setIsAdmin(user.role === Role.ADMIN);
        setFeedback(`Benvenuto/a ${user.name}`);
        setTimeout(() => {
          setFeedback('');
        }, 3000);
        await fetchPhase();
      } catch (error) {
        if (error.message !== "Unauthorized") {
          setFeedbackFromError(error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [fetchPhase]);

  const setFeedbackFromError = (err) => {
    const message = err.message ? err.message : 'Unknown Error';
    setFeedback(message);
  };

  //Gestione della login
  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      setIsAdmin(user.role === Role.ADMIN);
      setFeedback(`Benvenuto/a ${user.name}`);
      setTimeout(() => {
        setFeedback('');
      }, 3000);
      await fetchPhase();
    } catch (error) {
      if (error.message === "Unauthorized") {
        setFeedback("Username e/o password errati. Riprova.");
        setTimeout(() => {
          setFeedback('');
        }, 3000);
      } else {
        setFeedbackFromError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  //Gestione del logout 
  const handleLogout = async () => {
    try {
      await API.logOut();
      setLoggedIn(false);
      setUser(null);
      setIsAdmin(false);
      navigate('/', { replace: true });
      setFeedback('Logout effettuato con successo');
      setTimeout(() => {
        setFeedback('');
      }, 3000);
    } catch (error) {
      setFeedbackFromError(error);
    }
  };

  //Gestione per apertura e chiusure dei Modal di info e contatto
  const handleCloseInfoModal = () => setShowInfoModal(false);
  const handleShowInfoModal = () => setShowInfoModal(true);

  const handleCloseContactModal = () => setShowContactModal(false);
  const handleShowContactModal = () => setShowContactModal(true);

  return (
    <PhaseProvider>
      <FeedbackContext.Provider value={{ setFeedback, setFeedbackFromError }}>
        <div className="min-vh-100 d-flex flex-column">
          <Navbar bg="primary" variant="dark" expand="lg" className="justify-content-between">
            <Container>
              <Navbar.Brand className="d-flex align-items-center ms-0">
                {piggyBankIcon}
                <span className="ms-1">Budget Sociale</span>
              </Navbar.Brand>
            </Container>
            {loggedIn ? (
              <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
            ) : (
              <Button variant="success" onClick={() => navigate('/')}>Login</Button>
            )}
          </Navbar>

          <Container fluid className="flex-grow-1 d-flex flex-column">
            {feedback && (
              <Alert variant={loggedIn ? 'success' : 'danger'} className="mt-3">
                {feedback}
              </Alert>
            )}
            {loading ? (
              <div className="d-flex justify-content-center align-items-center flex-grow-1">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <Routes>
                <Route
                  path="/"
                  element={
                    loggedIn ? (
                      <Navigate to={`/phase${currentPhase}`} replace />
                    ) : (
                      <LoginForm login={handleLogin} />
                    )
                  }
                />

                {/* Routes per admin e user, il ruolo dell'utente é passato come prop */}
                <Route
                  path="/phase0"
                  element={<Phase0 userRole={user ? user.role : null} />}
                />
                <Route
                  path="/phase1"
                  element={<Phase1 userRole={user ? user.role : null} />}
                />
                <Route
                  path="/phase2"
                  element={<Phase2 userRole={user ? user.role : null} />}
                />
                <Route
                  path="/phase3"
                  element={<Phase3 userRole={user ? user.role : null} />}
                />

                <Route
                  path="/user/add-proposal"
                  element={<AddProposalPage userId={user ? user.id : null} />}
                />
                <Route
                  path="/user/edit-proposal/:id"
                  element={<EditProposalPage />}
                />
                <Route
                  path="/user/view-voted-proposals"
                  element={<ViewVotedProposalsPage />}
                />

                {/* Utenti anonimi */}
                <Route path="/utenti/anonimi" element={<UtentiAnonimiPages />} />

                {/* Gestione altre routes */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            )}
          </Container>
          <footer className="bg-primary text-white text-center p-3 mt-auto" style={{ height: '100px' }}>
            <Container>
              <Row>
                <Col md={4}>
                  <h5>Budget Sociale</h5>
                  <p>&copy; {new Date().getFullYear()}</p>
                </Col>
                <Col md={4}>
                  <h5>Quick Links</h5>
                  <ul className="list-unstyled">
                    <li><Button variant="link" className="text-white" onClick={handleShowContactModal}>Contact</Button></li>
                  </ul>
                </Col>
                <Col md={4}>
                  <h5>Info</h5>
                  <Button variant="outline-light" onClick={handleShowInfoModal}>
                    <FaInfoCircle /> Info
                  </Button>
                </Col>
              </Row>
            </Container>
          </footer>
          <Modal show={showContactModal} onHide={handleCloseContactModal}>
            <Modal.Header closeButton>
              <Modal.Title>Contatta l'amministratore</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Email: francesco.gabrieli.fg@gmail.com</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={handleCloseContactModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={showInfoModal} onHide={handleCloseInfoModal}>
            <Modal.Header closeButton>
              <Modal.Title>Info</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Questo é il sito di un'associazione a scopo di lucro che ha il compito di definire le attività per il prossimo anno.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={handleCloseInfoModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </FeedbackContext.Provider>
    </PhaseProvider>
  );
}

export default App;
