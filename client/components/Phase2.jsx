import React, { useState, useEffect } from 'react';
import { Container, Button, ListGroup, Alert, Dropdown, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaEye } from 'react-icons/fa';
import API from '../API.mjs';
import { usePhase } from '../contexts/PhaseContext';
import './AdminPhase2.css';
import './UserPhase2.css';

const Phase2 = ({ userRole }) => {
  const [proposals, setProposals] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [feedback, setFeedback] = useState({ message: '', variant: '' });
  const [userId, setUserId] = useState(null);
  const [selectedVotes, setSelectedVotes] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const { fetchPhase, setPhase } = usePhase();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  //Ottenere informazioni sull'utente
  const fetchUserInfo = async () => {
    try {
      const userInfo = await API.getUserInfo();
      setUserId(userInfo.id);
      fetchUserPreferences(userInfo.id);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };
  //Ottenere le preferenze dell'utente
  const fetchUserPreferences = async (userId) => {
    try {
      const preferences = await API.getAllPreferences(userId);
      if (preferences.length === 0) {
        console.log('L\'utente non ha ancora inserito preferenze.');
      }
      
      const preferencesMap = preferences.reduce((acc, pref) => {
        acc[pref.proposalId] = pref.score;
        return acc;
      }, {});
      
      setUserPreferences(preferencesMap);
      setSelectedVotes(preferences.length);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProposals();
    }
  }, [userId]);

  //Ottenere tutte le proposte dal database
  const fetchProposals = async () => {
    try {
      const allProposals = await API.getAllProposals();
      setProposals(allProposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  //Gestione della votazione per una proposta
  const handleVote = async (proposalId, score) => {
    try {
      

      let currentPhaseState = await API.getCurrentPhase();
      if (currentPhaseState !== 2) {
        setFeedback({ message: 'Impossibile completare l\'operazione, la fase è già stata completata', variant: 'danger' });
        setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
        return;
      }

      const userVotes = await API.addPreferenceToProposal(userId, proposalId, score);
      if (userVotes) {
        setSelectedVotes(userVotes.length);
        setUserPreferences(prevPreferences => ({ ...prevPreferences, [proposalId]: score }));
      }

      setFeedback({ message: 'Preferenza aggiunta correttamente', variant: 'success' });
      setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
    } catch (error) {
      setFeedback({ message: 'Errore durante la votazione. Riprova.', variant: 'danger' });
      setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
    }
  };

  //Gestione per la votazione di una proposta da parte dell'utente stesso
  const handleSelfVoteClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  //Gestione per la navigazione alla pagina delle preferenze
  const handleViewPreferences = () => {
    navigate(`/user/view-voted-proposals`, { state: { userId } });
  };

  //Gestione dell'avanzamento alla fase successiva
  const handleNextPhase = async () => {
    try {
      await setPhase();
      await fetchPhase();
      setFeedback({ message: 'Passaggio alla Fase 3...', variant: 'success' });
      setTimeout(() => {
        setFeedback({ message: '', variant: '' });
        navigate(`/phase3`);
      }, 3000);
    } catch (error) {
      console.error('Error advancing to next phase:', error);
      setFeedback({ message: 'Errore nel passaggio alla Fase 3', variant: 'danger' });
      setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
    }
  };

  return (
    <Container className="user-phase2-container">
      <h2 className="phase-header user-phase-title">Phase 2: Voting Proposals</h2>
      {feedback.message && <Alert variant={feedback.variant}>{feedback.message}</Alert>}
  
      <div className="phase-container">
        <ListGroup className="proposals-list">
          {proposals.map(proposal => (
            <ListGroup.Item key={proposal.id} className="phase-content proposal-card rounded shadow">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="proposal-description">{proposal.description}</p>
                  <p className="proposal-cost">Cost: {proposal.cost} €</p>
                </div>
                <div>
                  {proposal.user_id !== userId ? (
                    <Dropdown>
                      <Dropdown.Toggle variant="success">
                        {userPreferences[proposal.id] ? `Voted: ${userPreferences[proposal.id]}` : 'Vote'}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {[1, 2, 3].map(score => (
                          <Dropdown.Item
                            key={score}
                            onClick={() => handleVote(proposal.id, score)}
                            disabled={userPreferences[proposal.id] !== undefined}
                          >
                            {score}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : (
                    <Button variant="secondary" onClick={handleSelfVoteClick}>
                      Vote
                    </Button>
                  )}
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
  
      <div className="d-flex justify-content-between mt-3">
        <Button variant="primary" onClick={handleViewPreferences}>
          <FaEye /> Visualizza Preferenze
        </Button>
        {userRole === 'Admin' && (
            <Button variant="outline-warning" onClick={handleNextPhase}>
            <FaArrowRight /> Passa alla Fase 3
          </Button>
        )}
      </div>
  
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1,
        }}
      >
        <Toast.Header>
          <strong className="me-auto">Attenzione!</strong>
        </Toast.Header>
        <Toast.Body>Non puoi votare la tua proposta</Toast.Body>
      </Toast>
    </Container>
  );
};

export default Phase2;
