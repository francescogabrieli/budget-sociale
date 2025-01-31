import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaCheck } from 'react-icons/fa';
import API from '../API.mjs';
import './EditProposalPage.css';

const EditProposalPage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const { budget } = state;
  const [proposal, setProposal] = useState({ description: '', cost: '' });
  const [feedback, setFeedback] = useState({ message: '', variant: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProposal();
  }, []);

  //Ottenere dettagli della proposta
  const fetchProposal = async () => {
    try {
      const fetchedProposal = await API.getProposalsById(id);
      setProposal({ 
        description: fetchedProposal.description || '', 
        cost: fetchedProposal.cost || '' 
      }); 
    } catch (error) {
      console.error('Error fetching proposal:', error);
    }
  };

  //Gestione aggiornamento proposta e vari controlli
  const handleUpdateProposal = async (event) => {
    event.preventDefault();

    if (parseFloat(proposal.cost) > budget) {
        setFeedback({ message: 'Il costo della proposta modificata supera il budget disponibile', variant: 'danger' });
        setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
        return;
    } else if (parseFloat(proposal.cost) <= 0) {
      setFeedback({ message: 'Il costo della proposta deve essere maggiore di 0', variant: 'danger' });
      setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
      return;
    } else if(proposal.description.length > 50) {
      setFeedback({ message: 'La descrizione é troppo lunga, riprova.', variant: 'danger' });
      setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
      return;
    }

    let currentPhaseState = await API.getCurrentPhase();
      console.log("Phase before deleting proposal:", currentPhaseState); 
      if(currentPhaseState !== 1) {
        setFeedback({message: "Impossibile completare l'operazione, la fase è già stata completata", variant: 'danger'});
        setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
        return;
      }

    try {
        await API.updateProposal(proposal, id);
        setFeedback({ message: 'Proposta aggiornata correttamente', variant: 'success' });

        setTimeout(() => {
            setFeedback({ message: '', variant: '' });
            navigate(-1);
        }, 3000);
    } catch (error) {
        console.error('Error updating proposal:', error);
        setFeedback({ message: 'Proposta non aggiornata', variant: 'danger' });
        setTimeout(() => {
            setFeedback({ message: '', variant: '' });
            navigate(-1);
        }, 3000);
    }
  };

  //Cambiamento campi di input
  const handleChange = (event) => {
    const { name, value } = event.target;
    setProposal({ ...proposal, [name]: value });
  };

  //Gestione per il tasto indietro
  const handleBack = () => {
    navigate(-1); 
  };

  return (
    <Container className="edit-proposal-container">
        <Button variant="secondary" className="mb-3" onClick={handleBack}>
            <FaArrowLeft className="me-2" /> Indietro
        </Button>
        <h2 className="form-title">Modifica Proposta</h2>
        {feedback.message && <Alert variant={feedback.variant}>{feedback.message}</Alert>}
        <Form className="edit-proposal-form" onSubmit={handleUpdateProposal}>
            <Form.Group className="mb-3" controlId="description">
                <Form.Label>Descrizione</Form.Label>
                <Form.Control
                    type="text"
                    name="description"
                    value={proposal.description}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="cost">
                <Form.Label>Costo</Form.Label>
                <Form.Control
                    type="number"
                    name="cost"
                    value={proposal.cost}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Button variant="primary" type="submit">
                <FaCheck /> Salva Modifiche
            </Button>
        </Form>
    </Container>
  );
};

export default EditProposalPage;
