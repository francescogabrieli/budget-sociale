const USER_NOT_AUTHORIZED = "User not authorized";

export class UserNotAuthorizedError extends Error {
    constructor() {
        super();
        this.customMessage = USER_NOT_AUTHORIZED;
        this.customCode = 403;
    }
}