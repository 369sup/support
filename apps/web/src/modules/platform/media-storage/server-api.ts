import { mediaStorageServerFacade } from "./composition/media-storage.composition";

export const deleteMedia = mediaStorageServerFacade.deleteMedia;
export const getMediaReference = mediaStorageServerFacade.getMediaReference;
export const quarantineMedia = mediaStorageServerFacade.quarantineMedia;
export const storeMedia = mediaStorageServerFacade.storeMedia;
