import { describe, expect, it } from "vitest";

import { InMemoryCustomPropertyAdapter } from "../adapters/outbound/persistence/in-memory-custom-property.adapter";
import type { CustomPropertyIdGeneratorPort } from "../application/ports/outbound/custom-property.repository.port";
import { CustomPropertyService } from "../application/services/custom-property.service";
import type {
  DefineOrganizationRepositoryPropertyInput,
  OrganizationRepositoryPropertyDefinition,
} from "../domain/custom-property";

class FixedPropertyIdGenerator implements CustomPropertyIdGeneratorPort {
  nextPropertyId(): string {
    return "property-environment";
  }
}

function createService() {
  return new CustomPropertyService(
    new InMemoryCustomPropertyAdapter(),
    new FixedPropertyIdGenerator(),
  );
}

describe("CustomPropertyService", () => {
  it("defines a typed property and rejects a duplicate normalized name", async () => {
    const service = createService();
    const input: DefineOrganizationRepositoryPropertyInput = {
      allowedValues: ["production", "staging"],
      canRepositoryActorsSet: false,
      defaultValue: "staging",
      description: "Deployment environment",
      isExplicitValueRequired: false,
      isRequired: true,
      name: "environment",
      organizationId: "organization-1",
      valueType: "single-select",
    };

    await expect(service.define(input)).resolves.toEqual({
      propertyId: "property-environment",
      status: "defined",
    });
    await expect(
      service.define({ ...input, name: "ENVIRONMENT" }),
    ).resolves.toEqual({ status: "name-conflict" });
  });

  it("requires an explicit value when the schema says a default is insufficient", async () => {
    const service = createService();
    const definitions: readonly OrganizationRepositoryPropertyDefinition[] = [
      {
        allowedValues: [],
        canRepositoryActorsSet: false,
        defaultValue: "platform",
        description: "",
        isExplicitValueRequired: true,
        isRequired: true,
        name: "owner",
        organizationId: "organization-1",
        propertyId: "property-owner",
        valueType: "text",
      },
    ];

    await expect(
      service.setValues(
        ["repository-1"],
        definitions,
        {},
        "account-owner",
      ),
    ).resolves.toEqual({ status: "required-value-missing" });
  });

  it("sets a batch value and finds the matching repository", async () => {
    const repository = new InMemoryCustomPropertyAdapter();
    const service = new CustomPropertyService(
      repository,
      new FixedPropertyIdGenerator(),
    );
    const definition: OrganizationRepositoryPropertyDefinition = {
      allowedValues: ["production", "staging"],
      canRepositoryActorsSet: false,
      defaultValue: null,
      description: "",
      isExplicitValueRequired: false,
      isRequired: false,
      name: "environment",
      organizationId: "organization-1",
      propertyId: "property-environment",
      valueType: "single-select",
    };
    await repository.define(definition);

    await expect(
      service.setValues(
        ["repository-1"],
        [definition],
        { "property-environment": "production" },
        "account-owner",
      ),
    ).resolves.toEqual({ status: "updated" });
    await expect(
      service.search("organization-1", "environment", "production"),
    ).resolves.toEqual(["repository-1"]);
  });
});
