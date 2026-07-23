import { describe, expect, it } from "vitest";

import { hasSameOrigin } from "./src/app/_authentication/same-origin";

describe("same-origin mutation guard", () => {
  it("uses the browser-visible Host header instead of an internally normalized URL host", () => {
    const request = new Request("http://localhost:3100/api/example", {
      headers: {
        host: "127.0.0.1:3100",
        origin: "http://127.0.0.1:3100",
      },
    });

    expect(hasSameOrigin(request)).toBe(true);
  });

  it("rejects cross-origin, cross-protocol, missing, and malformed origins", () => {
    const cases = [
      new Request("http://localhost:3100/api/example", {
        headers: {
          host: "127.0.0.1:3100",
          origin: "https://attacker.example",
        },
      }),
      new Request("http://localhost:3100/api/example", {
        headers: {
          host: "127.0.0.1:3100",
          origin: "https://127.0.0.1:3100",
        },
      }),
      new Request("http://localhost:3100/api/example", {
        headers: { host: "127.0.0.1:3100" },
      }),
      new Request("http://localhost:3100/api/example", {
        headers: {
          host: "127.0.0.1:3100",
          origin: "not a URL",
        },
      }),
    ];

    for (const request of cases) {
      expect(hasSameOrigin(request)).toBe(false);
    }
  });

  it("honors the forwarded protocol supplied by the deployment proxy", () => {
    const request = new Request("http://localhost:3100/api/example", {
      headers: {
        host: "support.example",
        origin: "https://support.example",
        "x-forwarded-proto": "https",
      },
    });

    expect(hasSameOrigin(request)).toBe(true);
  });
});
