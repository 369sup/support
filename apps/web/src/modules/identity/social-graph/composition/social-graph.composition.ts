import { getProductionDatabase } from "../../../../../production-runtime";
import { PostgresUserFollowAdapter } from "../adapters/outbound/persistence/postgres-user-follow.adapter";
import { ToggleUserFollowHandler } from "../application/commands/toggle-user-follow.handler";
import type { ToggleUserFollowUseCase } from "../application/ports/inbound/toggle-user-follow.use-case";

export type SocialGraphServerFacade = Readonly<{
  toggleUserFollow: ToggleUserFollowUseCase["toggleUserFollow"];
}>;

const toggleUserFollow = new ToggleUserFollowHandler(
  new PostgresUserFollowAdapter(getProductionDatabase()),
);

export const socialGraphServerFacade: SocialGraphServerFacade = {
  toggleUserFollow:
    toggleUserFollow.toggleUserFollow.bind(toggleUserFollow),
};
