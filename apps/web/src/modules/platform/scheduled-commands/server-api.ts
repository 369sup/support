import { scheduledCommandsServerFacade } from "./composition/scheduled-commands.composition";

export const claimDueScheduledCommands =
  scheduledCommandsServerFacade.claimDueScheduledCommands;
export const completeScheduledCommand =
  scheduledCommandsServerFacade.completeScheduledCommand;
export const failScheduledCommand =
  scheduledCommandsServerFacade.failScheduledCommand;
export const reconcileExpiredCommandLeases =
  scheduledCommandsServerFacade.reconcileExpiredCommandLeases;
export const scheduleCommand =
  scheduledCommandsServerFacade.scheduleCommand;
