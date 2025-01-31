import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaTimes, FaCheck } from 'react-icons/fa';
import API from '../API.mjs';
import './AddProposalPage.css';

const AddProposalPage = () => {
  //Ottengo lo stato della location per ottenere userId e budget
  const { state } = useLocation();
  const { userId, budget } = state;
  const [newProposal, setNewProposal] = useState({ description: '', cost: '' });
  const [feedback, setFeedback] = useState({ message: '', variant: 'info' });
  const navigate = useNavigate();

  //Gestione cambiamento di input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProposal({ ...newProposal, [name]: value });
  };
  //Gestione dell'aggiunta di una proposta con gestione per i vari errori
  const handleAddProposal = async (event) => {
    event.preventDefault();
  
    if (/\d/.test(newProposal.description)) {
      setFeedback({ message: 'La descrizione non può contenere numeri', variant: 'danger' });
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
  
    if (parseFloat(newProposal.cost) > budget) {
      setFeedback({ message: 'Il costo della proposta supera il budget disponibile', variant: 'danger' });
      setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
      return;
    } else if (parseFloat(newProposal.cost) <= 0) {
      setFeedback({ message: 'Il costo della proposta deve essere maggiore di 0', variant: 'danger' });
      setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
      return;
    } else if(newProposal.description.length > 50) {
      setFeedback({ message: 'La descrizione é troppo lunga, riprova.', variant: 'danger' });
      setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
      return;
    }
  
    try {
      const userProposals = await API.getProposalsById(userId);
      if (userProposals.length >= 3) {
        setFeedback({ message: 'Hai già aggiunto un massimo di 3 proposte', variant: 'danger' });
        setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
        return;
      }
  
      const addedProposal = await API.addProposal({ ...newProposal, userId });
      setFeedback({ message: 'Proposta aggiunta correttamente', variant: 'success' });
  
      setNewProposal(addedProposal);
  
      setTimeout(() => {
        setFeedback({ message: '', variant: '' });
        navigate(-1);
      }, 3000);
    } catch (error) {
      console.error('Error adding proposal:', error);
      setFeedback({ message: 'Errore durante l\'aggiunta della proposta', variant: 'danger' });
      setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
    }
  };
  

  //Gestione del pulsante Indietro
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container className="add-proposal-container">
      <Button variant="secondary" className="mb-3" onClick={handleBack}>
      <FaArrowLeft className="me-2" /> Indietro
      </Button>
      <h2 className="form-title">Aggiungi Proposta</h2>
      {feedback.message && <Alert variant={feedback.variant}>{feedback.message}</Alert>}
      <Form className="add-proposal-form" onSubmit={handleAddProposal}>
        <Form.Group controlId="formDescription">
          <Form.Label>Descrizione</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter description"
            name="description"
            value={newProposal.description}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <Form.Group controlId="formCost" style={{ marginBottom: '10px' }}>
          <Form.Label>Costo (€)</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter cost"
            name="cost"
            value={newProposal.cost}
            onChange={handleInputChange}
            required
          />
        </Form.Group>
        <div className="d-flex justify-content-end">
          <Button variant="secondary" className="me-2" onClick={() => navigate(-1)}>
            <FaTimes /> Cancella
          </Button>
          <Button variant="primary" type="submit">
            <FaCheck /> Conferma
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddProposalPage;
