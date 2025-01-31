import db from "../db/db.mjs";
import crypto from 'crypto';

export default function UserDao() {
    /**
     * This function retrieves a user by its username
     * @param username - The username of the user
     * @param password - The password of the user
     * @returns A promise that will be resolved with the user if the user exists, false otherwise
     */
    this.getUserByCredentials = (username, password) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT id, name, surname, role, username, password, salt FROM users WHERE username=?';
            db.get(sql, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve(false); 
                } else {
                    
                    const user = { id: row.id, name: row.name, surname: row.surname, role: row.role, username: row.username };

                    
                    crypto.scrypt(password, row.salt, 32, (err, hashedPassword) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        // Stampa dell'hash generato da crypto.scrypt
                        const hashedPasswordHex = hashedPassword.toString('hex');

                        if (!hashedPassword) {
                            resolve(false);
                            return;
                        }


                        if (hashedPasswordHex !== row.password) {
                            resolve(false); 
                        } else {
                            resolve(user); 
                        }
                    });
                }
            });
        });
    }
}
