

const SERVER_URL = 'http://localhost:3001/api';

/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (credentials) => {
    return await fetch(SERVER_URL + '/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',  // this parameter specifies that authentication cookie must be forwared. It is included in all the authenticated APIs.
        body: JSON.stringify(credentials),
    }).then(handleInvalidResponse)
    .then(response => response.json());
};

/**
 * This function is used to verify if the user is still logged-in.
 * It returns a JSON object with the user info.
 */
const getUserInfo = async () => {
    return await fetch(SERVER_URL + '/sessions/current', {
        credentials: 'include'
    }).then(handleInvalidResponse)
    .then(response => response.json());
};

/**
* This function destroy the current user's session (executing the log-out).
*/
const logOut = async() => {
    return await fetch(SERVER_URL + '/sessions/current', {
      method: 'DELETE',
      credentials: 'include'
    }).then(handleInvalidResponse);
};

/**
 * This function retrieves the current budget
 */
async function insertBudget(budget) {
    return await fetch(SERVER_URL + '/budget', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({amount: budget})
    }).then(handleInvalidResponse)
}

/**
 * This function increases the phase in databse (or insert it if there isn't any phase yet)
 */
const setPhase = async () => {
    try {
        const result = await fetch(SERVER_URL + '/budget/phase', {
            method: 'PUT',
            credentials: 'include'
        }).then(handleInvalidResponse);
        return result;
    } catch (error) {
        throw error;
    }
}

/**
 * This function retrieves the current phase
 */
async function getCurrentPhase() {
    try {
        const result = await fetch(SERVER_URL + '/budget/phase', {
            method: 'GET',
            credentials: 'include'
        }).then(handleInvalidResponse)
          .then(response => response.json());
        return result;
    } catch (error) {
        throw error;
    }
}


/**
 * This function retrieves the proposals of a user
 */
const getProposalsById = async (user_id) => {
    try {
        const response = await fetch(SERVER_URL + `/proposals/${user_id}`, {
            method: 'GET',
            credentials: 'include'
        }).then(handleInvalidResponse)
          .then(response => response.json());
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * This function adds a proposal to the database
 */
const addProposal = async (proposal, userId) => {
    try {
        const response = await fetch(SERVER_URL + `/proposals/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ ...proposal, user_id: userId })
        }).then(handleInvalidResponse)
          .then(response => response.json());
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * This function deletes a proposal from the database
 */
const deleteProposal = async (proposalId, userId) => {
    try {
        const response = await fetch(SERVER_URL + `/proposals/${proposalId}`, {
            method: 'DELETE',
            credentials: 'include'
        }).then(handleInvalidResponse);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * This function updates a proposal in the database
 */
const updateProposal = async (proposal, proposalId, userId) => {
    try {
        const response = await fetch(SERVER_URL + `/proposals/${proposalId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(proposal)
        }).then(handleInvalidResponse)
          .then(response => response.json());
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * This function adds a preference to a proposal
 */
const addPreferenceToProposal = async (user_id, proposalId, score) => {
    try {
        const response = await fetch(SERVER_URL + `/proposals/${proposalId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ score })
        }).then(handleInvalidResponse)
    } catch (err) {
        throw err; 
    }
};

/**
 * This function retrieves all the proposals
 */
const getAllProposals = async () => {
    try {
        const response = await fetch(SERVER_URL + `/proposals`, {
            method: 'GET',
            credentials: 'include'
        }).then(handleInvalidResponse)
            .then(response => response.json());
        return response;
        
    } catch(error) {
        throw error;
    }
} 


/**
 * This function deletes a preference from a proposal
 */
const deletePreference = async (userId, proposalId) => {
    try {
        const response = await fetch(SERVER_URL + `/preferences/${proposalId}`, {
            method: 'DELETE',
            credentials: 'include'
        }).then(handleInvalidResponse)
        return response;
    } catch(error) {
        throw error
    }
};

/**
 * This function retrieves all the preferences of a user
 */
const getAllPreferences = async (userId) => {
    try {
        const response = await fetch(SERVER_URL + `/preferences/${userId}`, {
            method: 'GET',
            credentials: 'include'
        }).then(handleInvalidResponse)
            .then(response => response.json());
        return response
    } catch (error) {
        throw error;
    }
};

  
  
/**
 * This function retrieves the current budget
 */
const getCurrentBudget = async () => {
    try {
        const response = await fetch(SERVER_URL + `/budget`, {
            method: 'GET',
            credentials: 'include'
        }).then(handleInvalidResponse)
          .then(response => response.json());
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * This function retrieves all the proposals approved
 */
const getProposalsApproved = async () => {
    try {
        const response = await fetch(`${SERVER_URL}/proposals/approved`, {
            method: 'POST',
            credentials: 'include'
        }).then(handleInvalidResponse)
            .then(response => response.json());
        return response;
    } catch (error) {
        throw error;
    }
}

/**
 * This function retrieves all the proposals not approved
 */
const getProposalsNotApproved = async () => {
    try {
        const response = await fetch(`${SERVER_URL}/proposals/not-approved`, {
            method: 'POST',
            credentials: 'include'
        }).then(handleInvalidResponse)
            .then(response => response.json());
        return response;
    } catch (error) {
        throw error;
    }
}

/**
 * This function resets the database
 */
const resetAll = async () => {
    try {
        const response = await fetch(SERVER_URL + `/reset-database`, {
            method: 'POST',
            credentials: 'include'
        }).then(handleInvalidResponse)
            .then(response => response.json());
        return response;
    } catch(error) {
        throw error;
    }
}


function handleInvalidResponse(response) {
    if (!response.ok) { throw Error(response.statusText) }
    let type = response.headers.get('Content-Type');
    if (type !== null && type.indexOf('application/json') === -1){
        throw new TypeError(`Expected JSON, got ${type}`)
    }
    return response;
}


const API = { logIn, getUserInfo, logOut, insertBudget, setPhase, getCurrentPhase, getProposalsById, addProposal, deleteProposal, updateProposal, getCurrentBudget, getAllProposals, addPreferenceToProposal, getAllPreferences, deletePreference, getProposalsApproved, getProposalsNotApproved, resetAll };
export default API;