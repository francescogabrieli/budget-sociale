import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../API.mjs';

const PhaseContext = createContext();

export const PhaseProvider = ({ children }) => {
    const [currentPhase, setCurrentPhase] = useState(0);

    //Recupero della fase corrente
    const fetchPhase = async () => {
        try {
            const phase = await API.getCurrentPhase();
            setCurrentPhase(phase);
        } catch (error) {
            console.error('Error fetching phase:', error);
        }
    };

    //Avanzamento della fase
    const setPhase = async (newPhase) => {
        try {
            await API.setPhase(newPhase);
            setCurrentPhase(newPhase);
        } catch (error) {
            console.error('Error setting phase:', error);
        }
    };

    useEffect(() => {
        fetchPhase();
    }, []);

    const contextValue = { currentPhase, setPhase, fetchPhase };

    return (
        <PhaseContext.Provider value={contextValue}>
            {children}
        </PhaseContext.Provider>
    );
};

export const usePhase = () => {
    const context = useContext(PhaseContext);
    if (!context) {
        throw new Error('usePhase must be used within a PhaseProvider');
    }
    return context;
};

export default PhaseContext;
