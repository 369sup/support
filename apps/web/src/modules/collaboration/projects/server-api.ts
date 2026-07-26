import { projectsServerFacade } from "./composition/projects.composition";

export type {
  CollaborationProject,
  ProjectItem,
  ProjectItemStatus,
} from "./contracts/collaboration-project";
export const listAccountProjects =
  projectsServerFacade.listAccountProjects;
export const listRepositoryProjects =
  projectsServerFacade.listRepositoryProjects;
export const updateProjectItemStatus =
  projectsServerFacade.updateProjectItemStatus;
