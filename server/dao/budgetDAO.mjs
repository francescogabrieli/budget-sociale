import db from "../db/db.mjs";
import Budget from "../models/budget.mjs";
import { BudgetNotFoundError, BudgetAlreadyExistError, PhaseNotFoundError } from "../Errors/budgetError.mjs";

export default function BudgetDao() {

    /**
     * This function inserts a budget into the database
     * @param amount - The amount of the budget
     * @returns A promise that will be resolved with the budget inserted
     */
    this.insertBudget = (amount) => {
        return new Promise((resolve, reject) => {
          const getCurrentPhaseSql = `SELECT phase FROM budget_phase`;
          db.get(getCurrentPhaseSql, [], (err, row) => {
            if (err) {
              reject(err);
            } else if (!row) {
              reject(new PhaseNotFoundError());
            } else {
              const currentPhase = row.phase;
              const insertBudgetSql = `UPDATE budget_phase SET amount = ? WHERE phase = ?`;
              db.run(insertBudgetSql, [amount, currentPhase], function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve(new Budget(amount));
                }
              });
            }
          });
        });
      };
      

    /**
     * This function retrives the current budget from the database
     * @returns A promise that will be resolved with the current budget
     */
    this.getCurrentBudget = () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT amount FROM budget_phase`;
            db.get(sql, [], (err, row) => {
                if(err) {
                    reject(err);
                } else if(!row) {
                    reject(new BudgetNotFoundError());
                } else {
                    resolve(row);
                }
            });
        });
    };

    /**
     * This function increases the phase in databse (or insert it if there isn't any phase yet)
     * @returns A promise that will be resolved with the new phase
     */
    this.setPhase = () => {
        return new Promise((resolve, reject) => {
            const getCurrentPhaseSql = `SELECT phase FROM budget_phase`;
            
            db.get(getCurrentPhaseSql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    const insertPhaseSql = `INSERT INTO budget_phase (phase) VALUES (?)`;
                    db.run(insertPhaseSql, [0], function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(0); 
                        }
                    });
                } else {
                    const currentPhase = parseInt(row.phase); 
                    if (isNaN(currentPhase)) {
                        reject(new Error('Current phase is not a number'));
                        return;
                    }
                    
                    const newPhase = currentPhase + 1;
                    const updatePhaseSql = `UPDATE budget_phase SET phase = ?`;
                    
                    db.run(updatePhaseSql, [newPhase], function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            console.log("New phase:", newPhase);
                            resolve(newPhase); 
                        }
                    });
                }
            });
        });
    };
    

    /**
     * This function retrives the current phase from database
     * @returns A promise that will be resolved with the current phase
     */
    this.getCurrentPhase = () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT phase FROM budget_phase`;
            
            db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    const insertPhaseSql = `INSERT INTO budget_phase (phase) VALUES (?)`;
                    db.run(insertPhaseSql, [0], function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            // Select the phase again after inserting the default value
                            db.get(sql, [], (err, row) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(row.phase);
                                }
                            });
                        }
                    });
                } else {
                    resolve(row.phase);
                }
            });
        });
    };

}