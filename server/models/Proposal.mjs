/**
 * Model for Proposal component
 */
export default function Proposal(id, user_id, description, cost, isApproved=0) {
    this.id = id;
    this.user_id = user_id;
    this.description = description;
    this.cost = cost;
    this.isApproved = isApproved;
}

/**
 * Model for n x n association between Proposal and Vote tables
 */
export function Vote(user_id, prop_id, score=0) {
    this.user_id = user_id;
    this.prop_id = prop_id;
    this.score = score;
}
