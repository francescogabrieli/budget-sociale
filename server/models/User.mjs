/**
 * Model for User component
 */
export class User {
    constructor(id, name, surname, role, username) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.role = role;
        this.username = username;
    }
}


const Role = Object.freeze({
    ADMIN: 'Admin',
    MEMBER: 'Member'
});

export { Role };
