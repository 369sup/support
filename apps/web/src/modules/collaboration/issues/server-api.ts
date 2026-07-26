import { issuesServerFacade } from "./composition/issues.composition";

export type {
  RepositoryIssue,
  RepositoryIssueState,
} from "./contracts/repository-issue";

export const createIssue = issuesServerFacade.createIssue;
export const getRepositoryIssue = issuesServerFacade.getRepositoryIssue;
export const listRepositoryIssues = issuesServerFacade.listRepositoryIssues;
