import React, { useState, useEffect } from 'react';
import { Container, Button, ListGroup, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaArrowRight } from 'react-icons/fa';
import API from '../API.mjs';
import './UserPhase1.css';
import { usePhase } from '../contexts/PhaseContext';

const Phase1 = ({ userRole }) => {
  const [proposals, setProposals] = useState([]);
  const [feedback, setFeedback] = useState({ message: '', variant: '' });
  const [userId, setUserId] = useState(null);
  const [budget, setBudget] = useState(null);
  const navigate = useNavigate();
  const { fetchPhase, setPhase } = usePhase();
  
  useEffect(() => {
    fetchUserInfo();
    fetchBudget();
  }, []);

  //Ottenere informazioni sull'utente
  const fetchUserInfo = async () => {
    try {
      const userInfo = await API.getUserInfo();
      setUserId(userInfo.id);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  //Ottenere il budget definito nella precedente fase
  const fetchBudget = async () => {
    try {
      const budget = await API.getCurrentBudget();
      setBudget(budget.amount);
    } catch (error) {
      console.error('Error fetching budget:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProposals();
    }
  }, [userId]);

  //Ottenere le proposte dell'utente
  const fetchProposals = async () => {
    try {
      const userProposals = await API.getProposalsById(userId);
      if (userProposals.length === 0) {
        console.log('L\'utente non ha ancora inserito proposte.');
      }
      setProposals(userProposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  //Gestione per l'eliminazione di una proposta
  const handleDeleteProposal = async (id) => {
    try {

      let currentPhaseState = await API.getCurrentPhase();
      if(currentPhaseState !== 1) {
        setFeedback({message: "Impossibile completare l'operazione, la fase è già stata completata", variant: 'danger'});
        setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
        return;
      }


      await API.deleteProposal(id);
      setProposals(proposals.filter(proposal => proposal.id !== id));
      setFeedback({ message: 'Proposta eliminata correttamente', variant: 'success' });
      setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);

      
      
    } catch (error) {
      console.error('Error deleting proposal:', error);
      setFeedback({ message: 'Proposta non eliminata', variant: 'danger' });
      setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
    }
  };

  //Gestione navigazione alla pagina di aggiunta proposta
  const goToAddProposalPage = () => {
    navigate('/user/add-proposal', { state: { userId, budget } }); 
  };

  //Gestione navigazione alla pagina di modifica proposta
  const goToEditProposalPage = (id) => {
    navigate(`/user/edit-proposal/${id}`, { state: { budget } });
  };

  //Gestione per il passaggio alla fase successiva
  const handleNextPhase = async () => {
    try {
      await setPhase();
      await fetchPhase();
      
      setFeedback({ message: 'Passaggio alla Fase 2...', variant: 'success' });
      setTimeout(() => {
        setFeedback({ message: '', variant: '' });
        navigate(`/phase2`);
      }, 3000);
    } catch (error) {
      console.error('Error advancing to next phase:', error);
      setFeedback({ message: 'Errore nel passaggio alla Fase 2', variant: 'danger' });
      setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
    }
  };

  return (
    <Container>
      <h2 className="phase-header user-phase-title">Phase 1: My Proposals</h2>
      {feedback.message && <Alert variant={feedback.variant}>{feedback.message}</Alert>}
      
      <div className="phase-container">
        <div className="budget-container">
          {budget !== null && (
            <div>
              <h3 className="budget-title">Budget Information</h3>
              <div className="budget-amount">
                <Alert variant="success">
                  Budget: {budget} €
                </Alert>
              </div>
            </div>
          )}
        </div>
  
        <div className="proposals-list">
          {proposals.length === 0 ? (
            <Alert variant="warning" className="no-proposals-message">
              Nessuna proposta inserita.
            </Alert>
          ) : (
            <ListGroup className="mt-3">
              {proposals.map(proposal => (
                <ListGroup.Item key={proposal.id} className="proposal-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p>{proposal.description}</p>
                      <p>Costo: {proposal.cost} €</p>
                    </div>
                    <div>
                      <Button variant="warning" className="me-2" onClick={() => goToEditProposalPage(proposal.id)}>
                        <FaEdit /> Modifica
                      </Button>
                      <Button variant="danger" onClick={() => handleDeleteProposal(proposal.id)}>
                        <FaTrash /> Elimina
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </div>
  
      <div className="d-flex justify-content-between mt-3">
        <div>
          <Button variant="primary" onClick={goToAddProposalPage}>
            <FaPlus /> Aggiungi Proposta
          </Button>
        </div>
        {userRole === 'Admin' && (
          <div>
            <Button variant="outline-warning" onClick={handleNextPhase}>
              <FaArrowRight /> Passa alla Fase 2
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
  
};

export default Phase1;
