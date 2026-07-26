import { querySearchIndex } from "@/modules/platform/search-index/server-api";

import type { PublicSearchIndexGatewayPort } from "../../../application/ports/outbound/public-search-index.gateway.port";

export class PublicSearchIndexAdapter implements PublicSearchIndexGatewayPort {
  async queryPublic(query: string) {
    const result = await querySearchIndex({
      authorizationKey: "public",
      limit: 20,
      query,
    });
    return result.candidates.map(({ documentId, kind, score, title }) => ({
      documentId,
      kind,
      score,
      title,
    }));
  }
}
