import { describe, expect, it } from "vitest";

import type { PublicSearchIndexGatewayPort } from "../application/ports/outbound/public-search-index.gateway.port";
import { SearchPublicResourcesHandler } from "../application/queries/search-public-resources.handler";

describe("search public resources", () => {
  it("maps only supported public candidates to product routes", async () => {
    const index: PublicSearchIndexGatewayPort = {
      queryPublic: () =>
        Promise.resolve([
          {
            documentId: "repository:repository_support",
            kind: "repository",
            score: 3,
            title: "octocat/support",
          },
          {
            documentId: "unsupported",
            kind: "code",
            score: 2,
            title: "excluded",
          },
        ]),
    };

    const result = await new SearchPublicResourcesHandler(
      index,
    ).searchPublicResources("support");

    expect(result.results).toEqual([
      {
        documentId: "repository:repository_support",
        href: "/octocat/support",
        kind: "repository",
        score: 3,
        title: "octocat/support",
      },
    ]);
  });
});
