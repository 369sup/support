import { createSupabaseStorageGateway } from "@support/supabase/storage";

import {
  getProductionDatabase,
  getProductionSupabaseConfiguration,
} from "../../../../../production-runtime";
import { PostgresSupabaseMediaAdapter } from "../adapters/outbound/persistence/postgres-supabase-media.adapter";
import { SystemMediaClockAdapter } from "../adapters/outbound/system-media-clock.adapter";
import { SystemMediaHasherAdapter } from "../adapters/outbound/system-media-hasher.adapter";
import { SystemMediaIdGeneratorAdapter } from "../adapters/outbound/system-media-id-generator.adapter";
import { DeleteMediaHandler } from "../application/commands/delete-media.handler";
import { QuarantineMediaHandler } from "../application/commands/quarantine-media.handler";
import { StoreMediaHandler } from "../application/commands/store-media.handler";
import type { DeleteMediaUseCase } from "../application/ports/inbound/delete-media.use-case";
import type { GetMediaReferenceUseCase } from "../application/ports/inbound/get-media-reference.use-case";
import type { QuarantineMediaUseCase } from "../application/ports/inbound/quarantine-media.use-case";
import type { StoreMediaUseCase } from "../application/ports/inbound/store-media.use-case";
import { GetMediaReferenceHandler } from "../application/queries/get-media-reference.handler";

interface MediaStorageServerFacade {
  deleteMedia: DeleteMediaUseCase["deleteMedia"];
  getMediaReference: GetMediaReferenceUseCase["getMediaReference"];
  quarantineMedia: QuarantineMediaUseCase["quarantineMedia"];
  storeMedia: StoreMediaUseCase["storeMedia"];
}

function composeMediaStorageServerFacade(): MediaStorageServerFacade {
  const supabase = getProductionSupabaseConfiguration();
  const repository = new PostgresSupabaseMediaAdapter({
    bucket: supabase.storageBucket,
    database: getProductionDatabase(),
    storage: createSupabaseStorageGateway({
      secretKey: supabase.secretKey,
      url: supabase.url,
    }),
  });
  const clock = new SystemMediaClockAdapter();
  const storeHandler = new StoreMediaHandler(
    repository,
    clock,
    new SystemMediaHasherAdapter(),
    new SystemMediaIdGeneratorAdapter(),
  );
  const getHandler = new GetMediaReferenceHandler(repository);
  const quarantineHandler = new QuarantineMediaHandler(repository);
  const deleteHandler = new DeleteMediaHandler(repository, clock);

  return {
    deleteMedia: deleteHandler.deleteMedia.bind(deleteHandler),
    getMediaReference: getHandler.getMediaReference.bind(getHandler),
    quarantineMedia:
      quarantineHandler.quarantineMedia.bind(quarantineHandler),
    storeMedia: storeHandler.storeMedia.bind(storeHandler),
  };
}

let resolvedMediaStorageServerFacade:
  | MediaStorageServerFacade
  | undefined;

function resolveMediaStorageServerFacade(): MediaStorageServerFacade {
  resolvedMediaStorageServerFacade ??= composeMediaStorageServerFacade();
  return resolvedMediaStorageServerFacade;
}

export const mediaStorageServerFacade: MediaStorageServerFacade = {
  deleteMedia: (command) =>
    resolveMediaStorageServerFacade().deleteMedia(command),
  getMediaReference: (query) =>
    resolveMediaStorageServerFacade().getMediaReference(query),
  quarantineMedia: (command) =>
    resolveMediaStorageServerFacade().quarantineMedia(command),
  storeMedia: (command) =>
    resolveMediaStorageServerFacade().storeMedia(command),
};
