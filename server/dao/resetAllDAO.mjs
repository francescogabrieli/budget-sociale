import db from "../db/db.mjs";

export default function ResetAllDAO() {

    /**
     * This function resets all the tables in the database excluding users
     * @returns A promise that will be resolved with the result of the operation
     */
    this.resetAll = () => {
        return new Promise((resolve, reject) => {
            const sqlStatements = [
                'DELETE FROM proposals',
                'DELETE FROM votes',
                'DELETE FROM budget_phase'
            ];

            // Esegui le query una dopo l'altra usando Promise.all per gestire le promesse
            Promise.all(sqlStatements.map(sql => runQuery(sql)))
                .then(() => {
                    resolve({ success: true, message: 'Reset effettuato.' });
                })
                .catch(err => {
                    console.error('Error resetting database:', err);
                    reject({ success: false, error: 'Failed to reset database' });
                });
        });
    }

    // Funzione per eseguire una singola query
    function runQuery(sql) {
        return new Promise((resolve, reject) => {
            db.run(sql, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}