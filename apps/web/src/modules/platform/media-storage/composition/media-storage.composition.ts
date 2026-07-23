import { InMemoryMediaObjectAdapter } from "../adapters/outbound/persistence/in-memory-media-object.adapter";
import { SystemMediaClockAdapter } from "../adapters/outbound/system-media-clock.adapter";
import { SystemMediaHasherAdapter } from "../adapters/outbound/system-media-hasher.adapter";
import { SystemMediaIdGeneratorAdapter } from "../adapters/outbound/system-media-id-generator.adapter";
import { DeleteMediaHandler } from "../application/commands/delete-media.handler";
import { QuarantineMediaHandler } from "../application/commands/quarantine-media.handler";
import { StoreMediaHandler } from "../application/commands/store-media.handler";
import { GetMediaReferenceHandler } from "../application/queries/get-media-reference.handler";

const repository = new InMemoryMediaObjectAdapter();
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

export const mediaStorageServerFacade = {
  deleteMedia: deleteHandler.deleteMedia.bind(deleteHandler),
  getMediaReference: getHandler.getMediaReference.bind(getHandler),
  quarantineMedia: quarantineHandler.quarantineMedia.bind(quarantineHandler),
  storeMedia: storeHandler.storeMedia.bind(storeHandler),
};
