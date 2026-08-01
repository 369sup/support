import { Plus, Search } from "lucide-react";
import Link from "next/link";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getDashboardRepositoryView } from "@/modules/projections/dashboard/server-api";
import { RepositoryList } from "@/modules/repositories/repositories/browser-ui";

const visibilityOptions = ["all", "public", "private", "internal"] as const;
const stateOptions = ["all", "active", "archived"] as const;
const roleOptions = [
  "all",
  "read",
  "triage",
  "write",
  "maintain",
  "admin",
] as const;
const sortOptions = ["updated-desc", "name-asc"] as const;

function readOption<T extends readonly string[]>(
  value: string | undefined,
  options: T,
  fallback: T[number],
): T[number] {
  return options.find((option) => option === value) ?? fallback;
}

export default async function RepositoriesPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    q?: string;
    role?: string;
    sort?: string;
    state?: string;
    visibility?: string;
  }>;
}>) {
  const session = await requireCurrentSession();
  const [view, query] = await Promise.all([
    getDashboardRepositoryView(session),
    searchParams,
  ]);
  const searchQuery = query.q?.trim().toLocaleLowerCase("en-US") ?? "";
  const visibility = readOption(query.visibility, visibilityOptions, "all");
  const state = readOption(query.state, stateOptions, "all");
  const role = readOption(query.role, roleOptions, "all");
  const sort = readOption(query.sort, sortOptions, "updated-desc");
  const repositories = view.repositories
    .filter((repository) => {
      const doesMatchQuery =
        searchQuery === "" ||
        `${repository.owner.login}/${repository.name}`
          .toLocaleLowerCase("en-US")
          .includes(searchQuery) ||
        repository.description
          .toLocaleLowerCase("en-US")
          .includes(searchQuery);
      return (
        doesMatchQuery &&
        (visibility === "all" || repository.visibility === visibility) &&
        (state === "all" || repository.lifecycleState === state) &&
        (role === "all" || repository.permission === role)
      );
    })
    .toSorted((left, right) =>
      sort === "name-asc"
        ? `${left.owner.login}/${left.name}`.localeCompare(
            `${right.owner.login}/${right.name}`,
          )
        : Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
    );
  const hasFilters =
    searchQuery !== "" ||
    visibility !== "all" ||
    state !== "all" ||
    role !== "all" ||
    sort !== "updated-desc";

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Selected {view.context.kind} context
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em]">
              Repositories
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
              Find active and archived repositories visible to @
              {session.account.username}. Context selection narrows ownership
              but never grants access.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            href="/new"
          >
            <Plus aria-hidden="true" className="size-4" />
            New repository
          </Link>
        </div>

        <form
          className="mt-8 grid gap-3 rounded-xl border border-border bg-card p-4 lg:grid-cols-[minmax(16rem,1fr)_repeat(4,auto)_auto]"
          method="get"
        >
          <label className="relative">
            <span className="sr-only">Search repositories</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground"
            />
            <input
              className="h-9 w-full rounded-md border border-input bg-background pr-3 pl-9 text-sm"
              defaultValue={query.q}
              name="q"
              placeholder="Find a repository…"
            />
          </label>
          <FilterSelect label="Visibility" name="visibility" options={visibilityOptions} value={visibility} />
          <FilterSelect label="State" name="state" options={stateOptions} value={state} />
          <FilterSelect label="Role" name="role" options={roleOptions} value={role} />
          <FilterSelect label="Sort" name="sort" options={sortOptions} value={sort} />
          <button
            className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
            type="submit"
          >
            Apply
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {repositories.length} of {view.repositories.length} repositories
          </span>
          {hasFilters ? (
            <Link className="hover:text-foreground hover:underline" href="/repositories">
              Clear filters
            </Link>
          ) : null}
        </div>

        <div className="mt-4">
          <RepositoryList
            emptyMessage={
              view.repositories.length === 0
                ? "No repositories are available in this context."
                : "No repositories match these filters."
            }
            repositories={repositories}
          />
        </div>
      </section>
    </main>
  );
}

function FilterSelect({
  label,
  name,
  options,
  value,
}: Readonly<{
  label: string;
  name: string;
  options: readonly string[];
  value: string;
}>) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        className="h-9 rounded-md border border-input bg-background px-3 text-sm capitalize"
        defaultValue={value}
        name={name}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace("-", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
