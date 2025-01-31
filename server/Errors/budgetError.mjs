const BUDGET_NOT_FOUND = "Budget not found";
const BUDGET_ALREADY_EXIST = "Budget already exist";
const PHASE_NOT_FOUND = "Phase not found";
const NOT_IN_RIGHT_PHASE = "Not in right phase";

export class BudgetNotFoundError extends Error {
    constructor() {
        super();
        this.customMessage = BUDGET_NOT_FOUND;
        this.customCode = 404;
    }
}

export class BudgetAlreadyExistError extends Error {
    constructor() {
        super();
        this.customMessage = BUDGET_ALREADY_EXIST;
        this.customCode = 409;
    }
}


export class PhaseNotFoundError extends Error {
    constructor() {
        super();
        this.customMessage = PHASE_NOT_FOUND;
        this.customCode = 404;
    }
}

export class NotInRightPhaseError extends Error {
    constructor() {
        super()
        this.customMessage = NOT_IN_RIGHT_PHASE;
        this.customCode = 403;
    }
}