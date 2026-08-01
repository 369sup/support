import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { Archive, RotateCcw, Settings, Trash2 } from "lucide-react";
import Link from "next/link";

import { buildLinkHref } from "@/app/_route-contracts/route-contract";
import { readFormString } from "@/app/_route-contracts/read-form-string";
import { getPersonalAccountByUsername } from "@/modules/identity/accounts/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";
import {
  archiveRepository,
  changeRepositoryVisibility,
  deleteRepository,
  getRepositoryForAdministration,
  renameRepository,
  restoreDeletedRepository,
  unarchiveRepository,
  updateRepositoryProfile,
} from "@/modules/repositories/repositories/server-api";
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
import { Textarea } from "@support/shadcn/ui/textarea";

type OwnerLookupResult =
  | Readonly<{ kind: "organization"; login: string; id: string }>
  | Readonly<{ kind: "account"; login: string; id: string }>;

const repositoryStatusMessages: Readonly<Record<string, string>> = {
  archived: "Repository archived. It is now read-only.",
  created: "Empty repository created.",
  deleted: "Repository deleted. It can be restored during its restore window.",
  "confirmation-mismatch": "Type the full owner/name exactly to confirm.",
  "internal-visibility-not-available":
    "Internal visibility requires verified enterprise entitlement.",
  "invalid-description": "Descriptions can contain at most 350 characters.",
  "invalid-homepage": "Enter a valid HTTP or HTTPS homepage URL.",
  "invalid-name":
    "Use 1–100 ASCII letters, numbers, periods, hyphens, or underscores.",
  "invalid-state": "That operation is not available in the current lifecycle state.",
  "invalid-visibility": "Choose a supported visibility.",
  "permission-denied": "Repository administration permission is required.",
  "profile-updated": "Repository profile updated.",
  "repository-name-conflict": "That owner already has a repository with this name.",
  "repository-not-found": "The repository no longer exists.",
  renamed: "Repository renamed.",
  restored: "Repository restored without its prior team permissions.",
  "restore-window-expired": "The 90-day restore window has expired.",
  unarchived: "Repository unarchived.",
  "visibility-changed": "Repository visibility changed.",
};

async function resolveOwnerByLogin(
  owner: string,
): Promise<OwnerLookupResult | null> {
  const organization = await getOrganizationByLogin(owner);
  if (organization.status === "found") {
    return {
      kind: "organization",
      id: organization.organization.organizationId,
      login: organization.organization.login,
    };
  }

  const account = await getPersonalAccountByUsername(owner);
  if (!account.isSuccessful) {
    return null;
  }
  return {
    kind: "account",
    id: account.account.accountId,
    login: account.account.username,
  };
}

async function resolveRepositoryActionContext(formData: FormData) {
  const session = await requireCurrentSession();
  const owner = await resolveOwnerByLogin(
    readFormString(formData, "ownerLogin"),
  );
  if (owner === null) {
    redirect("/repositories?repository=repository-not-found");
  }
  return {
    actorAccountId: session.account.accountId,
    ownerId: owner.id,
    ownerKind: owner.kind,
    ownerLogin: owner.login,
    name: readFormString(formData, "repositoryName"),
  };
}

function repositorySettingsUrl(
  owner: string,
  repository: string,
  status: string,
) {
  return buildLinkHref(
    "page-owner-repository-settings",
    { owner, repository },
    { repository: status },
  );
}

async function renameRepositoryAction(formData: FormData): Promise<never> {
  "use server";

  const context = await resolveRepositoryActionContext(formData);
  const result = await renameRepository({
    ...context,
    newName: readFormString(formData, "newName"),
  });
  const targetName =
    result.status === "renamed" ? result.repository.name : context.name;
  revalidatePath(`/${context.ownerLogin}/${context.name}`);
  redirect(
    repositorySettingsUrl(context.ownerLogin, targetName, result.status),
  );
}

function revalidateRepositoryPresentation(context: {
  name: string;
  ownerLogin: string;
}) {
  revalidatePath(`/${context.ownerLogin}/${context.name}`);
  revalidatePath(`/${context.ownerLogin}`);
  revalidatePath(`/${context.ownerLogin}/${context.name}/settings`);
  revalidatePath("/dashboard");
  revalidatePath("/explore");
  revalidatePath("/repositories");
  revalidatePath(`/orgs/${context.ownerLogin}/repositories`);
}

async function updateRepositoryProfileAction(
  formData: FormData,
): Promise<never> {
  "use server";

  const context = await resolveRepositoryActionContext(formData);
  const result = await updateRepositoryProfile({
    ...context,
    description: readFormString(formData, "description"),
    homepage: readFormString(formData, "homepage"),
  });
  revalidateRepositoryPresentation(context);
  redirect(
    repositorySettingsUrl(context.ownerLogin, context.name, result.status),
  );
}

async function changeRepositoryVisibilityAction(
  formData: FormData,
): Promise<never> {
  "use server";

  const context = await resolveRepositoryActionContext(formData);
  const result = await changeRepositoryVisibility({
    ...context,
    visibility: readFormString(formData, "visibility"),
  });
  revalidatePath(`/${context.ownerLogin}/${context.name}`);
  redirect(
    repositorySettingsUrl(context.ownerLogin, context.name, result.status),
  );
}

async function archiveRepositoryAction(formData: FormData): Promise<never> {
  "use server";

  const context = await resolveRepositoryActionContext(formData);
  const result = await archiveRepository({
    ...context,
    confirmation: readFormString(formData, "confirmation"),
  });
  revalidatePath(`/${context.ownerLogin}/${context.name}`);
  redirect(
    repositorySettingsUrl(context.ownerLogin, context.name, result.status),
  );
}

async function unarchiveRepositoryAction(formData: FormData): Promise<never> {
  "use server";

  const context = await resolveRepositoryActionContext(formData);
  const result = await unarchiveRepository({
    ...context,
    confirmation: readFormString(formData, "confirmation"),
  });
  revalidatePath(`/${context.ownerLogin}/${context.name}`);
  redirect(
    repositorySettingsUrl(context.ownerLogin, context.name, result.status),
  );
}

async function deleteRepositoryAction(formData: FormData): Promise<never> {
  "use server";

  const context = await resolveRepositoryActionContext(formData);
  const result = await deleteRepository({
    ...context,
    confirmation: readFormString(formData, "confirmation"),
  });
  revalidatePath(`/${context.ownerLogin}/${context.name}`);
  if (result.status === "deleted") {
    redirect(
      context.ownerKind === "organization"
        ? `/organizations/${context.ownerLogin}/settings/repositories?repository=deleted`
        : "/settings/repositories?repository=deleted",
    );
  }
  redirect(
    repositorySettingsUrl(context.ownerLogin, context.name, result.status),
  );
}

async function restoreRepositoryAction(formData: FormData): Promise<never> {
  "use server";

  const context = await resolveRepositoryActionContext(formData);
  const result = await restoreDeletedRepository({
    ...context,
    confirmation: readFormString(formData, "confirmation"),
  });
  revalidatePath(`/${context.ownerLogin}/${context.name}`);
  redirect(
    repositorySettingsUrl(context.ownerLogin, context.name, result.status),
  );
}

function RepositoryIdentityFields({
  owner,
  repository,
}: Readonly<{ owner: string; repository: string }>) {
  return (
    <>
      <input name="ownerLogin" type="hidden" value={owner} />
      <input name="repositoryName" type="hidden" value={repository} />
    </>
  );
}

export default async function RepositorySettingsPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ owner: string; repository: string }>;
  searchParams: Promise<{ repository?: string }>;
}>) {
  const session = await requireCurrentSession();
  const [routeParams, query] = await Promise.all([params, searchParams]);
  const owner = await resolveOwnerByLogin(routeParams.owner);
  if (owner === null) {
    notFound();
  }
  const repositoryResult = await getRepositoryForAdministration({
    actorAccountId: session.account.accountId,
    ownerId: owner.id,
    name: routeParams.repository,
  });
  if (repositoryResult.status !== "found") {
    notFound();
  }
  const repository = repositoryResult.repository;
  const fullName = `${repository.owner.username}/${repository.name}`;
  const message =
    query.repository === undefined
      ? undefined
      : repositoryStatusMessages[query.repository];
  let LifecycleIcon = Trash2;
  if (repository.lifecycleState === "deleted") {
    LifecycleIcon = RotateCcw;
  } else if (repository.lifecycleState === "archived") {
    LifecycleIcon = Archive;
  }

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-4xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Repository settings · {fullName}
        </p>
        <div className="mt-3 flex items-start gap-4">
          <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em]">
              Repository settings
            </h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              Manage repository identity, visibility, and lifecycle without
              creating or reading Git content.
            </p>
          </div>
        </div>

        <p className="mt-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          State: <strong className="text-foreground">{repository.lifecycleState}</strong>
          {" · "}Visibility: <strong className="text-foreground">{repository.visibility}</strong>
          {repository.restoreUntil === null
            ? null
            : ` · Restore through ${new Date(repository.restoreUntil).toLocaleString()}`}
        </p>
        {message !== undefined ? (
          <p
            className="mt-4 rounded-lg border border-border bg-card px-4 py-3 text-sm"
            role="status"
          >
            {message}
          </p>
        ) : null}

        {repository.lifecycleState === "active" ? (
          <div className="mt-8 grid gap-6">
            <form
              action={updateRepositoryProfileAction}
              className="rounded-xl border border-border bg-card p-6"
            >
              <RepositoryIdentityFields
                owner={owner.login}
                repository={repository.name}
              />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="repository-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    defaultValue={repository.description}
                    id="repository-description"
                    maxLength={350}
                    name="description"
                    placeholder="A short description of this repository"
                  />
                  <FieldDescription>
                    Public repository summary, up to 350 characters.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="repository-homepage">
                    Homepage
                  </FieldLabel>
                  <Input
                    defaultValue={repository.homepage}
                    id="repository-homepage"
                    name="homepage"
                    placeholder="https://example.com"
                    type="url"
                  />
                  <FieldDescription>
                    Optional HTTP or HTTPS URL with more information.
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <Button className="mt-5" type="submit">
                Save profile
              </Button>
            </form>

            <form
              action={renameRepositoryAction}
              className="rounded-xl border border-border bg-card p-6"
            >
              <RepositoryIdentityFields
                owner={owner.login}
                repository={repository.name}
              />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="new-repository-name">
                    Repository name
                  </FieldLabel>
                  <Input
                    defaultValue={repository.name}
                    id="new-repository-name"
                    maxLength={100}
                    name="newName"
                    pattern="[A-Za-z0-9._-]+"
                    required
                  />
                  <FieldDescription>
                    Renaming preserves this management record and changes its URL.
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <Button className="mt-5" type="submit">
                Rename repository
              </Button>
            </form>

            <form
              action={changeRepositoryVisibilityAction}
              className="rounded-xl border border-border bg-card p-6"
            >
              <RepositoryIdentityFields
                owner={owner.login}
                repository={repository.name}
              />
              <Field>
                <FieldLabel htmlFor="repository-visibility">
                  Visibility
                </FieldLabel>
                <Select
                  defaultValue={repository.visibility}
                  name="visibility"
                  required
                >
                  <SelectTrigger id="repository-visibility" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    {repository.visibility === "internal" ? (
                      <SelectItem value="internal">Internal</SelectItem>
                    ) : null}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Internal is retained only for an existing verified fixture.
                </FieldDescription>
              </Field>
              <Button className="mt-5" type="submit">
                Change visibility
              </Button>
            </form>
          </div>
        ) : null}

        {repository.lifecycleState === "active" &&
        repository.owner.kind === "organization" ? (
          <p className="mt-6 text-sm">
            <Link
              className="underline decoration-dashed underline-offset-4"
              href={`/${owner.login}/${repository.name}/settings/access`}
            >
              Manage active organization team access
            </Link>
          </p>
        ) : null}

        <section className="mt-8 rounded-xl border border-destructive/40 bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <LifecycleIcon aria-hidden="true" className="size-4" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Lifecycle controls</h2>
              <p className="text-sm text-muted-foreground">
                Type <strong>{fullName}</strong> to confirm each operation.
              </p>
            </div>
          </div>

          {repository.lifecycleState === "deleted" ? (
            <LifecycleForm
              action={restoreRepositoryAction}
              buttonLabel="Restore repository"
              owner={owner.login}
              repository={repository.name}
            />
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <LifecycleForm
                action={
                  repository.lifecycleState === "active"
                    ? archiveRepositoryAction
                    : unarchiveRepositoryAction
                }
                buttonLabel={
                  repository.lifecycleState === "active"
                    ? "Archive repository"
                    : "Unarchive repository"
                }
                owner={owner.login}
                repository={repository.name}
              />
              <LifecycleForm
                action={deleteRepositoryAction}
                buttonLabel="Delete repository"
                isDestructive
                owner={owner.login}
                repository={repository.name}
              />
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function LifecycleForm({
  action,
  buttonLabel,
  isDestructive = false,
  owner,
  repository,
}: Readonly<{
  action: (formData: FormData) => Promise<never>;
  buttonLabel: string;
  isDestructive?: boolean;
  owner: string;
  repository: string;
}>) {
  return (
    <form action={action} className="mt-6 md:mt-0">
      <RepositoryIdentityFields owner={owner} repository={repository} />
      <Field>
        <FieldLabel htmlFor={`${buttonLabel}-${repository}`}>
          Confirmation
        </FieldLabel>
        <Input
          id={`${buttonLabel}-${repository}`}
          name="confirmation"
          placeholder={`${owner}/${repository}`}
          required
        />
      </Field>
      <Button
        className="mt-4"
        type="submit"
        variant={isDestructive ? "destructive" : "outline"}
      >
        {buttonLabel}
      </Button>
    </form>
  );
}
