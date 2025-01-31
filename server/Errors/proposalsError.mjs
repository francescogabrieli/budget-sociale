const PROPOSALS_NOT_FOUND = "Proposal not found";
const VOTE_YOUR_OWN_PROPOSAL = "You can't vote your own proposal";
const PROPOSAL_ALREADY_VOTE = "You have already voted for this proposal";
const USER_HAVE_TOO_MANY_PROPOSALS = "User have already 3 proposals";
const PREFERENCES_NOT_FOUND = "Preferences not found";

export class ProposalsNotFoundError extends Error {
    constructor() {
        super();
        this.customMessage = PROPOSALS_NOT_FOUND;
        this.customeCode = 404;
    }
}

export class VoteOwnProposalError extends Error {
    constructor() {
        super();
        this.customMessage = VOTE_YOUR_OWN_PROPOSAL
        this.customCode = 400;
    }
}

export class ProposalAlreadyVoteError extends Error {
    constructor() {
        super()
        this.customMessage = PROPOSAL_ALREADY_VOTE
        this.customCode = 409;
    }
}

export class UserHaveTooManyProposalsError extends Error {
    constructor() {
        super()
        this.customMessage = USER_HAVE_TOO_MANY_PROPOSALS;
        this.customCode = 403;
    }
}

export class PreferencesNotFoundError extends Error {
    constructor() {
        super()
        this.customMessage = PREFERENCES_NOT_FOUND;
        this.customCode = 404;
    }
}