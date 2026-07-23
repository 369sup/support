import { eventPublicationServerFacade } from "./composition/event-publication.composition";

export const getPublicationMetrics =
  eventPublicationServerFacade.getPublicationMetrics;
export const listDeadLetters = eventPublicationServerFacade.listDeadLetters;
export const publishPendingEvents =
  eventPublicationServerFacade.publishPendingEvents;
export const redeliverDeadLetter =
  eventPublicationServerFacade.redeliverDeadLetter;

export const registerEventSource =
  eventPublicationServerFacade.registerEventSource;
