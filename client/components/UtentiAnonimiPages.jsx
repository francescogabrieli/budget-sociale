import React, { useState, useEffect } from 'react';
import { Container, Card, Alert } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';
import API from '../API.mjs';
import './UserPhase0.css';

const UtentiAnonimiPages = () => {
    const [approvedProposals, setApprovedProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPhase, setCurrentPhase] = useState(null);

    useEffect(() => {
        fetchPhase();
    }, []);

    useEffect(() => {
        if (currentPhase === 3) {
            fetchApprovedProposals();
        } else {
            setLoading(false);
        }
    }, [currentPhase]);

    const fetchPhase = async () => {
        try {
            const phase = await API.getCurrentPhase();
            setCurrentPhase(phase);
        } catch (err) {
            console.error('Error fetching phase:', err);
            setError('Failed to fetch phase. Please try again later.');
            setLoading(false);
        }
    };

    const fetchApprovedProposals = async () => {
        try {
            const approved = await API.getProposalsApproved();
            setApprovedProposals(approved);
        } catch (err) {
            console.error('Error fetching approved proposals:', err);
            setError('Failed to fetch proposals. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="text-center mt-5">
                <Alert variant="danger">
                    {error}
                </Alert>
            </Container>
        );
    }

    if (currentPhase !== 3) {
        return (
            <Container fluid className="user-phase-container">
                <div className="user-phase-content">
                    <h4 className="user-phase-title">Loading...</h4>
                    <p className="user-phase-message">La fase di definizione delle proposte è ancora in corso.</p>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <h2 className="phase-header user-phase-title">Phase 3: Approved Proposals</h2>
            <div className="phase-container">
                <div className="proposal-container">
                    {approvedProposals.length === 0 ? (
                        <Alert variant="warning" className="no-proposals-message">
                            No approved proposals.
                        </Alert>
                    ) : (
                        approvedProposals.map(proposal => (
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
                        ))
                    )}
                </div>
            </div>
        </Container>
    );
};

export default UtentiAnonimiPages;
