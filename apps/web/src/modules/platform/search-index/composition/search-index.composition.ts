import { InMemorySearchIndexAdapter } from "../adapters/outbound/persistence/in-memory-search-index.adapter";
import { RemoveSearchDocumentHandler } from "../application/commands/remove-search-document.handler";
import { UpsertSearchDocumentHandler } from "../application/commands/upsert-search-document.handler";
import { QuerySearchIndexHandler } from "../application/queries/query-search-index.handler";

const repository = new InMemorySearchIndexAdapter();
const upsertHandler = new UpsertSearchDocumentHandler(repository);
const removeHandler = new RemoveSearchDocumentHandler(repository);
const queryHandler = new QuerySearchIndexHandler(repository);

export const searchIndexServerFacade = {
  querySearchIndex: queryHandler.querySearchIndex.bind(queryHandler),
  removeSearchDocument: removeHandler.removeSearchDocument.bind(removeHandler),
  upsertSearchDocument: upsertHandler.upsertSearchDocument.bind(upsertHandler),
};
