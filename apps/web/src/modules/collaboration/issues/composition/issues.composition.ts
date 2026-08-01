import { InMemoryIssueAdapter } from "../adapters/outbound/persistence/in-memory-issue.adapter";
import { CreateIssueHandler } from "../application/commands/create-issue.handler";
import type { CreateIssueUseCase } from "../application/ports/inbound/create-issue.use-case";
import type { GetRepositoryIssueUseCase } from "../application/ports/inbound/get-repository-issue.use-case";
import type { ListRepositoryIssuesUseCase } from "../application/ports/inbound/list-repository-issues.use-case";
import { GetRepositoryIssueHandler } from "../application/queries/get-repository-issue.handler";
import { ListRepositoryIssuesHandler } from "../application/queries/list-repository-issues.handler";

export type IssuesServerFacade = Readonly<{
  createIssue: CreateIssueUseCase["createIssue"];
  getRepositoryIssue: GetRepositoryIssueUseCase["getRepositoryIssue"];
  listRepositoryIssues: ListRepositoryIssuesUseCase["listRepositoryIssues"];
}>;

function composeIssuesServerFacade(): IssuesServerFacade {
  const issues = new InMemoryIssueAdapter();
  const createIssue = new CreateIssueHandler(issues);
  const getRepositoryIssue = new GetRepositoryIssueHandler(issues);
  const listRepositoryIssues = new ListRepositoryIssuesHandler(issues);
  return {
    createIssue: createIssue.createIssue.bind(createIssue),
    getRepositoryIssue: getRepositoryIssue.getRepositoryIssue.bind(getRepositoryIssue),
    listRepositoryIssues:
      listRepositoryIssues.listRepositoryIssues.bind(listRepositoryIssues),
  };
}

export const issuesServerFacade = composeIssuesServerFacade();
