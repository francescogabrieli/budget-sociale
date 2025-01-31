import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Table, Button, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaTrash } from 'react-icons/fa'; 
import API from '../API.mjs';
import './ViewVotedProposalsPage.css'; 

const ViewVotedProposalsPage = () => {
  const [votedProposals, setVotedProposals] = useState([]);
  const [feedback, setFeedback] = useState({ message: '', variant: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state.userId;

  useEffect(() => {
    fetchVotedProposals();
  }, []);

  // Ottenere proposte votate
  const fetchVotedProposals = async () => {
    try {
      const userVotedProposals = await API.getAllPreferences(userId);
      setVotedProposals(userVotedProposals);
    } catch (error) {
      console.error('Errore nel recupero delle proposte votate:', error);
    }
  };

  // Gestione per la rimozione della preferenza
  const handleDeletePreference = async (proposalId) => {
    try {
      let currentPhaseState = await API.getCurrentPhase();
      if (currentPhaseState !== 2) {
        setFeedback({ message: "Impossibile completare l'operazione, la fase è già stata completata", variant: 'danger' });
        setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
        return;
      }

      await API.deletePreference(userId, proposalId);

      setVotedProposals(prevProposals => prevProposals.filter(pref => pref.id !== proposalId));
      setFeedback({ message: 'Preferenza rimossa correttamente', variant: 'success' });
      setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
    } catch (error) {
      console.error('Errore nella rimozione della preferenza:', error);
      setFeedback({ message: 'Errore nella rimozione della preferenza', variant: 'danger' });
      setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
    }
  };

  // Gestione tasto indietro
  const handleBack = () => {
    navigate(-1); 
  };

  return (
    <Container className="view-voted-container">
      <h2 className="mt-3 page-title">Le mie proposte votate</h2>
      {feedback.message && <Alert variant={feedback.variant}>{feedback.message}</Alert>}
      <Button variant="outline-secondary" onClick={handleBack} className="mb-3">
        <FaArrowLeft className="me-2" /> Indietro
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Descrizione</th>
            <th>Costo (€)</th>
            <th>Score</th> 
            <th>Azione</th>
          </tr>
        </thead>
        <tbody>
          {votedProposals.map((proposal, index) => (
            <tr key={proposal.id}>
              <td>{index + 1}</td>
              <td>{proposal.description}</td>
              <td>{proposal.cost}</td>
              <td>{proposal.score}</td> 
              <td>
                <Button variant="danger" onClick={() => handleDeletePreference(proposal.id)}>
                  <FaTrash /> Rimuovi Voto
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ViewVotedProposalsPage;
