import { notFound, redirect } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import {
  defineOrganizationRepositoryProperty,
  listOrganizationRepositoryProperties,
  type CustomPropertyValue,
} from "@/modules/organizations/custom-properties/server-api";
import { listActiveOrganizationMembershipsForOrganization } from "@/modules/organizations/organization-memberships/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";
import { Button } from "@support/shadcn/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@support/shadcn/ui/field";
import { Input } from "@support/shadcn/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@support/shadcn/ui/select";

async function requireOrganizationOwner(login: string) {
  const session = await requireCurrentSession();
  const organization = await getOrganizationByLogin(login);
  if (organization.status !== "found") {notFound();}
  const memberships =
    await listActiveOrganizationMembershipsForOrganization(
      organization.organization.organizationId,
    );
  if (
    !memberships.some(
      (membership) =>
        membership.accountId === session.account.accountId &&
        membership.role === "owner",
    )
  ) {
    notFound();
  }
  return {
    actorAccountId: session.account.accountId,
    organization: organization.organization,
  };
}

function parseDefaultValue(
  valueType: string,
  raw: string,
): CustomPropertyValue {
  if (raw === "") {return null;}
  if (valueType === "true-false") {return raw === "true";}
  if (valueType === "multi-select") {
    return raw.split(",").map((value) => value.trim()).filter(Boolean);
  }
  return raw;
}

async function definePropertyAction(formData: FormData): Promise<never> {
  "use server";

  const login = readFormString(formData, "organizationLogin");
  const { organization } = await requireOrganizationOwner(login);
  const valueType = readFormString(formData, "valueType");
  const allowedValues = readFormString(formData, "allowedValues")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const result = await defineOrganizationRepositoryProperty({
    organizationId: organization.organizationId,
    name: readFormString(formData, "name"),
    description: readFormString(formData, "description"),
    valueType:
      valueType === "single-select" ||
      valueType === "multi-select" ||
      valueType === "true-false"
        ? valueType
        : "text",
    allowedValues,
    defaultValue: parseDefaultValue(
      valueType,
      readFormString(formData, "defaultValue"),
    ),
    isRequired: formData.get("required") === "on",
    isExplicitValueRequired:
      formData.get("requireExplicitValue") === "on",
    canRepositoryActorsSet:
      formData.get("repositoryActorsCanSet") === "on",
  });
  redirect(
    `/organizations/${organization.login}/settings/custom_properties?property=${result.status}`,
  );
}

const messages: Readonly<Record<string, string>> = {
  defined: "Custom property created.",
  "invalid-name": "Use at most 75 letters, numbers, _, -, $, or #.",
  "invalid-description": "Descriptions can contain at most 255 characters.",
  "invalid-allowed-values": "Allowed values must be unique printable ASCII.",
  "invalid-default-value": "The default value does not match the property type.",
  "name-conflict": "A property with that name already exists.",
};

export default async function OrganizationCustomPropertiesPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ login: string }>;
  searchParams: Promise<{ property?: string }>;
}>) {
  const routeParams = await params;
  const { organization } = await requireOrganizationOwner(routeParams.login);
  const [definitions, query] = await Promise.all([
    listOrganizationRepositoryProperties(organization.organizationId),
    searchParams,
  ]);
  const message =
    query.property === undefined ? undefined : messages[query.property];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-5xl">
        <div className="flex items-start gap-4">
          <span className="mt-1 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <SlidersHorizontal aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em]">
              Repository custom properties
            </h1>
            <p className="mt-3 leading-7 text-muted-foreground">
              Define structured metadata for repositories in{" "}
              {organization.displayName}.
            </p>
          </div>
        </div>

        {message !== undefined ? (
          <p className="mt-6 rounded-lg border border-border bg-card px-4 py-3 text-sm">
            {message}
          </p>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <form
            action={definePropertyAction}
            className="rounded-xl border border-border bg-card p-6"
          >
            <input
              name="organizationLogin"
              type="hidden"
              value={organization.login}
            />
            <h2 className="text-lg font-semibold">New property</h2>
            <FieldGroup className="mt-5">
              <Field>
                <FieldLabel htmlFor="property-name">Name</FieldLabel>
                <Input id="property-name" name="name" maxLength={75} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="property-description">
                  Description
                </FieldLabel>
                <Input
                  id="property-description"
                  name="description"
                  maxLength={255}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="property-type">Type</FieldLabel>
                <Select defaultValue="text" name="valueType">
                  <SelectTrigger id="property-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="single-select">Single select</SelectItem>
                    <SelectItem value="multi-select">Multi select</SelectItem>
                    <SelectItem value="true-false">True / false</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="property-values">
                  Allowed values
                </FieldLabel>
                <Input
                  id="property-values"
                  name="allowedValues"
                  placeholder="production, staging, development"
                />
                <FieldDescription>
                  Comma-separated; used by select properties.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="property-default">
                  Default value
                </FieldLabel>
                <Input id="property-default" name="defaultValue" />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input name="required" type="checkbox" /> Required
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input name="requireExplicitValue" type="checkbox" /> Require
                an explicit value
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input name="repositoryActorsCanSet" type="checkbox" /> Allow
                repository actors to set values
              </label>
            </FieldGroup>
            <Button className="mt-6" type="submit">
              Create property
            </Button>
          </form>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Property schema</h2>
            {definitions.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No custom properties yet.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {definitions.map((definition) => (
                  <li className="py-4" key={definition.propertyId}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium">{definition.name}</span>
                      <span className="rounded-full bg-muted px-2 py-1 font-mono text-xs">
                        {definition.valueType}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {definition.description === ""
                        ? "No description."
                        : definition.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {definition.isRequired ? "Required" : "Optional"}
                      {definition.defaultValue === null
                        ? ""
                        : " - default configured"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
