import { searchIndexServerFacade } from "./composition/search-index.composition";

export const querySearchIndex = searchIndexServerFacade.querySearchIndex;
export const removeSearchDocument = searchIndexServerFacade.removeSearchDocument;
export const upsertSearchDocument = searchIndexServerFacade.upsertSearchDocument;
