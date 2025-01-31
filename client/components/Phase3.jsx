import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Button, Modal, Row, Col } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { PhaseProvider, usePhase } from '../contexts/PhaseContext';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import API from '../API.mjs';
import './AdminPhase3.css';
import './UserPhase3.css';

const Phase3 = ({ userRole }) => {
    const [approvedProposals, setApprovedProposals] = useState([]);
    const [nonApprovedProposals, setNonApprovedProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState({ message: '', variant: '' });
    const [showModal, setShowModal] = useState(false);
    const { setPhase } = usePhase()
    
    const navigate = useNavigate();

    //Aggiungo il debounce per chiamare fetchProposals solo dopo 300ms che l'utente ha smesso di attirare eventi.
    //Se ad esempio ci fosse un input o un pulsante che richiede più fetch, si migliorano le performance e si riduce il numero di chiamate API
    const fetchProposals = debounce(async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            const approved = await API.getProposalsApproved();
            const notApproved = await API.getProposalsNotApproved();
            setApprovedProposals(approved);
            setNonApprovedProposals(notApproved);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching proposals:', err);
            setLoading(false);
        }
    }, 300);

    useEffect(() => {
        fetchProposals();
    }, []);

    //Gestione del riavvio del processo, quindi reset delle tabelle nel database
    const handleRestartProcess = async () => {
        try {
            await API.resetAll();
            setPhase()
            setFeedback({ message: "Riavvio del processo...", variant: 'info' });
            setTimeout(() => {
                setFeedback({ message: '', variant: '' });
                navigate(`/phase0`);
            }, 3000);
        } catch (error) {
            console.error('Error during reset:', error);
            setFeedback({ message: 'Errore durante il riavvio del processo.', variant: 'danger' });
            setTimeout(() => setFeedback({ message: '', variant: '' }), 3000);
        }
    };

    //Gestione visualizzazione e chiusura del Modal di avviso per il riavvio del processo
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);

    //Conferma del riavvio del processo e chiusura del Modal
    const handleConfirmRestart = () => {
        handleRestartProcess();
        handleCloseModal();
    };

    //Visualizzazione di uno spinner per attesa recupero dati da parte dell'applicazione
    if (loading) {
        return (
            <Container className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <h2 className="phase-header user-phase-title">Phase 3: Approved and Non-Approved Proposals</h2>
    
            {feedback.message && <Alert variant={feedback.variant}>{feedback.message}</Alert>}
    
            <div className="phase-container">
                <div className="proposal-container">
                    <h3 className="proposal-title">Approved Proposals</h3>
                    {approvedProposals.length === 0 ? (
                        <Alert variant="warning" className="no-proposals-message">
                            Non ci sono proposte approvate.
                        </Alert>
                    ) : (
                        <div>
                            {approvedProposals.map(proposal => (
                                <Card key={proposal.description} className="proposal-card">
                                    <Card.Body>
                                        <div className="d-flex align-items-center">
                                            <FaCheckCircle className="icon" size={30} color="green" />
                                            <div>
                                                <h5 className="card-title">{proposal.description}</h5>
                                                <p className="card-text">Proposed by: {proposal.username}</p>
                                                <p className="card-text">Cost: {proposal.cost} €</p>
                                                <p className="card-text">Total Score: {proposal.totScore}</p>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
    
                <div className="proposal-container">
                    <h3 className="proposal-title mt-5">Non-Approved Proposals</h3>
                    {nonApprovedProposals.length === 0 ? (
                        <Alert variant="warning" className="no-proposals-message">
                            Tutte le proposte sono state approvate.
                        </Alert>
                    ) : (
                        <div>
                            {nonApprovedProposals.map(proposal => (
                                <Card key={proposal.description} className="proposal-card">
                                    <Card.Body>
                                        <div className="d-flex align-items-center">
                                            <FaTimesCircle className="icon" size={30} color="red" />
                                            <div>
                                                <h5 className="card-title">{proposal.description}</h5>
                                                <p className="card-text">Cost: {proposal.cost} €</p>
                                                <p className="card-text">Total Score: {proposal.totScore}</p>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
    
            {userRole === 'Admin' && (
                <Container className="mb-5">
                    <Row>
                        <Col className="text-end">
                            <Button variant="outline-danger" className="restart-button" onClick={handleShowModal}>
                                Riavvia Processo
                            </Button>
                        </Col>
                    </Row>
                </Container>
            )}
    
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Attenzione!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Riavviando il processo verranno persi tutti i dati su proposte e votazioni, confermare?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Annulla
                    </Button>
                    <Button variant="danger" onClick={handleConfirmRestart}>
                        Conferma
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
    
}

export default Phase3;
