import React, { useState } from "react";
import { Form, Button, Container, Alert } from 'react-bootstrap';
import './AdminPhase0.css';
import { usePhase } from '../contexts/PhaseContext'; 
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API from '../API.mjs'; 
import './UserPhase0.css';

const Phase0 = ({ userRole }) => {
    const [budget, setBudget] = useState('');
    const { fetchPhase, setPhase } = usePhase(); 
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState({ message: '', variant: '' });

    //Gestione definizione budget e avanzamento alla fase successiva
    const handleDefineBudget = async () => {
        const parsedBudget = parseInt(budget);
        if (isNaN(parsedBudget)) {
            setFeedback({ message: 'Il budget deve essere un numero valido', variant: 'danger' });
            setTimeout(() => {
                setFeedback({ message: '', variant: '' });
            }, 3000);
            console.error('Il budget deve essere un numero valido');
            return;
        } else if(parsedBudget <= 0) {
            setFeedback({ message: 'Il budget deve essere un numero maggiore di zero', variant: 'danger' });
            setTimeout(() => {
                setFeedback({ message: '', variant: '' });
            }, 3000);
            return;
        }
    
        try {
            await API.insertBudget(parsedBudget);
            await API.getCurrentPhase();
            setPhase();
            await fetchPhase();
            setFeedback({ message: 'Passaggio alla Fase 1...', variant: 'success' });
            setTimeout(() => {
                setFeedback({ message: '', variant: '' });
                navigate(`/phase1`);
            }, 3000);
        } catch (error) {
            console.error('Errore durante l\'inserimento del budget:', error);
            setFeedback({ message: 'Errore nel salvataggio del budget.', variant: 'danger' });
            setTimeout(() => {
                setFeedback({ message: '', variant: '' });
            }, 3000);
        }
    };
    

    if(userRole === 'Admin') {
        return (
            <Container className="admin-phase-container">
                <div className="admin-phase-content p-4 rounded">
                    <h4 className="admin-phase-title">Fase 0</h4>
                    <div className="budget-form-container">
                        {feedback.message && <Alert variant={feedback.variant}>{feedback.message}</Alert>}
                        <h2 className="budget-form-title">Definizione del Budget</h2>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Definisci il Budget (in Euro):</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                />
                            </Form.Group>
                            <Button variant="primary" onClick={handleDefineBudget}>
                                <FaArrowRight /> Conferma budget e passa alla Fase 1
                            </Button>
                        </Form>
                    </div>
                </div>
            </Container>
        );
    } else {
        return (
            <Container fluid className="user-phase-container">
              <div className="user-phase-content">
                <h4 className="user-phase-title">Fase 0</h4>
                  <p className="user-phase-message">L'associazione sta definendo il budget, ritorna più tardi.</p>
              </div>
            </Container>
          );
    }
}    
    

export default Phase0;
