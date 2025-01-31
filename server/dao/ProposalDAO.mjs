/**
 * Data Access Object module for accessing proposals data
 */
import e from 'express';
import db from '../db/db.mjs';
import { ProposalsNotFoundError, VoteOwnProposalError, ProposalAlreadyVoteError, UserHaveTooManyProposalsError, PreferencesNotFoundError } from '../Errors/proposalsError.mjs';
import { UserNotAuthorizedError } from '../Errors/usersError.mjs';
import Proposal from '../models/proposal.mjs';
import Vote from '../models/proposal.mjs';
import BudgetDao from './budgetDAO.mjs';
import { BudgetNotFoundError, NotInRightPhaseError } from '../Errors/budgetError.mjs';
import { User } from '../models/User.mjs';


/**
     * Map database rows to Proposal objects.
     * 
     * @param {Array} rows - An array of database rows, where each row is an object containing fields id, user_id, description, cost, and isApproved.
     * @returns {Array} - An array of Proposal objects created from database rows.
     */
function mapRowsToProposals(rows) {
    return rows.map(row => 
        new Proposal(row.id, row.user_id, row.description, row.cost, row.isApproved)
    );
}


export default function ProposalDao() {

    
    /**
     * This function retrieves all proposals from the database for a single user
     * @param id - the user's id that owns the proposals
     * @returns A Promise that resolves the information of the proposals
     */
    this.getProposalsById = (id) => {
        return new Promise((resolve, reject) => {
            const checkPhaseSql = `SELECT phase FROM budget_phase`;
            db.get(checkPhaseSql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    const sql = `SELECT * FROM proposals WHERE user_id = ?`;
                    db.all(sql, [id], (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            const proposals = mapRowsToProposals(rows);
                            resolve(proposals);
                        }
                    });
                }
            });
        });
    };
    

    /**
     * This function retrieves all proposals from the database
     * @returns A Promise that resolves the information of the proposals
     */
    this.getAllProposals = () => {
        return new Promise((resolve, reject) => {
            const checkPhaseSql = `SELECT phase FROM budget_phase`;
            db.get(checkPhaseSql, [], (err, row) => {
                if(err) {
                    reject(err)
                } else {
                    const sql = `SELECT * FROM proposals`;
                    db.all(sql, [], (err, rows) => {
                        if(err) {
                            reject(err)
                        } else if(rows.length === 0) {
                            reject(new ProposalsNotFoundError())
                        } else {
                            const proposals = mapRowsToProposals(rows);
                            resolve(proposals);
                        }
                    })
                }
            })
        })
    }

    /**
     * This function deletes a proposal from database for a user
     * @param id - the id of the proposal
     * @returns A Promise that resolves the information of the proposals
     */
    this.deleteProposal = (id, user_id) => {
        return new Promise((resolve, reject) => {
            const checkPhaseSql = `SELECT phase FROM budget_phase`;
            db.get(checkPhaseSql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row.phase !== 1) {
                    reject(new NotInRightPhaseError());
                } else {
                    const verifySql = `SELECT user_id FROM proposals WHERE id = ?`;
                    db.get(verifySql, [id], (err, row) => {
                        if (err) {
                            reject(err); 
                        } else if (!row) {
                            reject(new ProposalsNotFoundError()); 
                        } else if (row.user_id !== user_id) {
                            reject(new UserNotAuthorizedError()); 
                        } else {
                            const sql = `DELETE FROM proposals WHERE id = ?`;
                            db.run(sql, [id], function(err) {
                                if (err) {
                                    reject(err); 
                                } else {
                                    resolve(); 
                                }
                            });
                        }
                    });
                }
            });
        });
    };
    

    /**
     * This function updates an existing proposal from database for a user
     * @param id - the id of the proposal
     * @returns A Promise that resolves the information of the proposals
     */
    this.updateProposal = (proposal, id, user_id) => {
        return new Promise((resolve, reject) => {
            const checkPhaseSql = `SELECT phase FROM budget_phase`;
            db.get(checkPhaseSql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row.phase !== 1) {
                    reject(new NotInRightPhaseError());
                } else {
                    const verifySql = `SELECT * FROM proposals WHERE id = ?`;
                    db.get(verifySql, [id], (err, row) => {
                        if (err) {
                            reject(err); 
                        } else if (!row) {
                            reject(new ProposalsNotFoundError()); 
                        } else if (row.user_id !== user_id) {
                            reject(new UserNotAuthorizedError()); 
                        } else {
                            const updateSql = `UPDATE proposals SET description = ?, cost = ? WHERE id = ? AND user_id = ?`;
                            const params = [proposal.description, proposal.cost, id, user_id];
    
                            db.run(updateSql, params, (err) => {
                                if (err) {
                                    reject(err); 
                                } else {
                                    resolve(proposal); 
                                }
                            });
                        }
                    });
                }
            });
        });
    };
    
    
    
    

    /**
     * This function inserts a new proposal in the database
     * @param proposal - the proposal to insert
     * @param user_id - the id of the user that insert the proposal
     * @returns A Promise that resolves the information of the proposals
     */
    this.addProposal = (proposal, user_id) => {
        return new Promise((resolve, reject) => {
            const checkPhaseSql = `SELECT phase FROM budget_phase`;
            db.get(checkPhaseSql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row.phase !== 1) {
                    reject(new NotInRightPhaseError());
                } else {
                    const sqlBudget = `SELECT amount FROM budget_phase`;
                    db.get(sqlBudget, [], (err, row) => {
                        if (err) {
                            reject(err);
                        } else if (!row) {
                            reject(new BudgetNotFoundError());
                        } else {
                            const checkNumberProposalsSql = `SELECT * FROM proposals WHERE user_id = ?`;
                            db.all(checkNumberProposalsSql, [user_id], (err, rows) => {
                                if (err) {
                                    reject(err);
                                }
                                if (rows.length >= 3) {
                                    reject(new UserHaveTooManyProposalsError());
                                } else {
                                    const query = `INSERT INTO proposals (user_id, description, cost, isApproved) VALUES (?, ?, ?, 0)`;
                                    db.run(query, [user_id, proposal.description, proposal.cost], function (err) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            proposal.id = this.lastID;
                                            resolve(proposal);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    }
    
    
    /**
     * This function inserts a preferences to a proposal 
     * @param user_id - The user that inserts the preference
     * @param  proposal_id - The id of the proposal
     * @param score - The score of the preference
     * @returns A Promise that resolves the information of the proposals
     */
    this.addPreferenceToProposal = (user_id, proposal_id, score) => {
        return new Promise((resolve, reject) => {
            
            const checkPhaseSql = `SELECT phase FROM budget_phase`;
            db.get(checkPhaseSql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row.phase !== 2) {
                    reject(new NotInRightPhaseError());
                } else {
                    const checkVoteSql = `SELECT user_id FROM votes WHERE prop_id = ? AND user_id = ?`;
                    db.get(checkVoteSql, [proposal_id, user_id], (err, row) => {
                        if (err) {
                            reject(err);
                        } else if (row) {
                            reject(new ProposalAlreadyVoteError());
                        } else {
                            
                            const checkProposalSql = `SELECT user_id FROM proposals WHERE id = ?`;
                            db.get(checkProposalSql, [proposal_id], (err, row) => {
                                if (err) {
                                    reject(err);
                                } else if (!row) {
                                    reject(new ProposalsNotFoundError());
                                } else {
                                    
                                    const insertVoteSql = `INSERT INTO votes (user_id, prop_id, score) VALUES (?, ?, ?)`;
                                    db.run(insertVoteSql, [user_id, proposal_id, score], (err) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(); 
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    };
    

      /**
       * This function retrieves all preferences from the database for a user
       * @param user_id - the user's id that owns the preferences
       * @param proposal_id - the id of the proposal  
       * @returns A Promise that resolves the information of the proposals  
       */
      this.getAllPreferences = (user_id) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT p.id, p.description, p.cost, v.score
                FROM proposals p
                JOIN votes v ON p.id = v.prop_id
                WHERE v.user_id = ?`;
            
            db.all(sql, [user_id], (err, rows) => {
                if (err) {
                    return reject(err);
                } else if (rows.length === 0) {
                    return reject(new PreferencesNotFoundError());
                } else {
                    resolve(rows); 
                }
            });
        });
    };
    
    

    /**
     * This function deletes a preference from database for a user
     * @param user_id - the id of the user
     * @param proposal_id - the id of the proposal to delete
     * @returns A Promise that resolves the information of the proposals
     */
    this.deletePreference = (user_id, proposal_id) => {
        return new Promise((resolve, reject) => {
            const checkPhaseSql = `SELECT phase FROM budget_phase`;
            db.get(checkPhaseSql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row.phase !== 2) {
                    reject(new NotInRightPhaseError());
                } else {
                    const checkSql = `SELECT * FROM votes WHERE user_id = ? AND prop_id = ?`;
                    db.get(checkSql, [user_id, proposal_id], (err, row) => {
                        if (err) {
                            reject(err);
                        } else if (!row) {
                            reject(new UserNotAuthorizedError());
                        } else {
                            const deleteSql = `DELETE FROM votes WHERE user_id = ? AND prop_id = ?`;
                            db.run(deleteSql, [user_id, proposal_id], function(err) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        }
                    });
                }
            });
        });
    };
    
    
      
      
    /**
     * This function retrieves all proposals approved from the database
     * @returns A Promise that resolves the information of the proposals
     */
    this.getProposalsApproved = async () => {
        let transactionStarted = false;
    
        try {
            console.log('Starting getProposalsApproved...');
    
            // Check if the phase is 3
            const checkPhaseSql = `SELECT phase FROM budget_phase`;
            const phaseResult = await new Promise((resolve, reject) => {
                db.get(checkPhaseSql, [], (err, row) => {
                    if (err) {
                        console.error('Error retrieving phase:', err);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
    
            if (phaseResult.phase !== 3) {
                return Promise.reject(new NotInRightPhaseError());
            }
    
            // Check if a transaction is already active
            if (!db.inTransaction) {
                // Start transaction
                await new Promise((resolve, reject) => {
                    db.run('BEGIN TRANSACTION', function(err) {
                        if (err) {
                            console.error('Error starting transaction:', err);
                            reject(err);
                        } else {
                            console.log('Transaction started.');
                            transactionStarted = true;
                            resolve();
                        }
                    });
                });
            }
    
            const budgetQuery = `SELECT amount FROM budget_phase`;
    
            // Retrieve budget amount
            const budgetResult = await new Promise((resolve, reject) => {
                db.get(budgetQuery, [], (err, row) => {
                    if (err) {
                        console.error('Error retrieving budget amount:', err);
                        if (transactionStarted) {
                            db.run('ROLLBACK');
                        }
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
    
            const budgetAmount = budgetResult.amount;
            console.log('Budget amount retrieved:', budgetAmount);
    
            // Retrieve proposals and process for approval
            const sql = `
                SELECT p.id AS prop_id, p.description, u.username, p.cost, COALESCE(SUM(v.score), 0) AS totScore
                FROM proposals p
                LEFT JOIN users u ON p.user_id = u.id
                LEFT JOIN votes v ON p.id = v.prop_id
                GROUP BY p.id
                ORDER BY totScore DESC`;
    
            console.log('Executing SQL:', sql);
    
            const rows = await new Promise((resolve, reject) => {
                db.all(sql, [], (err, rows) => {
                    if (err) {
                        console.error('Error retrieving proposals:', err);
                        if (transactionStarted) {
                            db.run('ROLLBACK');
                        }
                        reject(err);
                    } else {
                        console.log('Rows retrieved:', rows);
                        resolve(rows);
                    }
                });
            });
    
            let totalCost = 0;
            const approvedProposals = [];
    
            for (let row of rows) {
                const prop_id = row.prop_id;
                const cost = row.cost;
    
                if (totalCost + cost <= budgetAmount) {
                    const sqlUpdate = `UPDATE proposals SET isApproved = 1 WHERE id = ?`;
    
                    await new Promise((resolve, reject) => {
                        db.run(sqlUpdate, [prop_id], function(err) {
                            if (err) {
                                console.error(`Error approving proposal ${prop_id}:`, err);
                                if (transactionStarted) {
                                    db.run('ROLLBACK');
                                }
                                reject(err);
                            } else {
                                console.log(`Proposal ${prop_id} approved.`);
                                approvedProposals.push({
                                    description: row.description,
                                    username: row.username,
                                    cost: cost,
                                    totScore: row.totScore
                                });
                                totalCost += cost;
                                resolve();
                            }
                        });
                    });
    
                    // Check if adding more proposals would exceed the budget
                    if (totalCost >= budgetAmount) {
                        break; // Stop further approvals if budget is exceeded
                    }
                } else {
                    break; // Stop further approvals if budget is exceeded before this proposal
                }
            }
    
            if (transactionStarted) {
                await new Promise((resolve, reject) => {
                    db.run('COMMIT', function(err) {
                        if (err) {
                            console.error('Error committing transaction:', err);
                            reject(err);
                        } else {
                            console.log('Transaction committed.');
                            resolve();
                        }
                    });
                });
            }
    
            return approvedProposals; // Return approved proposals
        } catch (error) {
            console.error('Error in getProposalsApproved:', error);
            if (transactionStarted) {
                await new Promise((resolve, reject) => {
                    db.run('ROLLBACK', function(err) {
                        if (err) {
                            console.error('Error rolling back transaction:', err);
                            reject(err);
                        } else {
                            console.log('Transaction rolled back.');
                            resolve();
                        }
                    });
                });
            }
            return Promise.reject(error); // Use reject here
        }
    };
    
    
    

    /**
     * This function retrieves all proposals not approved from the database
     * @returns A Promise that resolves the information of the proposals
     */
    this.getProposalsNotApproved = async () => {
        return new Promise((resolve, reject) => {
            const checkPhaseSql = `SELECT phase FROM budget_phase`;
            db.get(checkPhaseSql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row.phase !== 3) {
                    reject(new NotInRightPhaseError());
                } else {
                    const sql = `
                        SELECT p.id, p.description, p.cost, COALESCE(SUM(v.score), 0) AS totScore
                        FROM proposals p
                        LEFT JOIN votes v ON p.id = v.prop_id
                        WHERE p.isApproved != 1
                        GROUP BY p.id, p.description, p.cost
                        ORDER BY totScore DESC`;
    
                    db.all(sql, [], (err, rows) => {
                        if (err) {
                            reject(err); 
                        } else {
                            resolve(rows); 
                        }
                    });
                }
            });
        });
    };



}
    



    

