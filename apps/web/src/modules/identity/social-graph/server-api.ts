import { socialGraphServerFacade } from "./composition/social-graph.composition";

export type { UserFollowState } from "./contracts/user-follow";
export const toggleUserFollow = socialGraphServerFacade.toggleUserFollow;
