import { searchPublicResources } from "@/modules/projections/search/server-api";

export default async function SearchPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ q?: string }>;
}>) {
  const query = String((await searchParams).q ?? "").trim();
  const result = await searchPublicResources(query);

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Public resources
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
          Search
        </h1>
        <form className="mt-7 flex gap-3">
          <label className="sr-only" htmlFor="search-query">
            Search query
          </label>
          <input
            className="min-w-0 flex-1 rounded-lg border border-white/15 bg-[#08111d] px-4 py-2.5 text-white outline-none focus:border-emerald-400"
            defaultValue={query}
            id="search-query"
            name="q"
            placeholder="Search profiles, repositories, issues, discussions, and projects"
          />
          <button
            className="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
            type="submit"
          >
            Search
          </button>
        </form>
        <ul className="mt-8 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          {result.results.map((item) => (
            <li className="px-5 py-4" key={item.documentId}>
              <a
                className="font-semibold text-white hover:text-emerald-200"
                href={item.href}
              >
                {item.title}
              </a>
              <p className="mt-1 text-xs font-medium tracking-wider text-slate-500 uppercase">
                {item.kind}
              </p>
            </li>
          ))}
          {query !== "" && result.results.length === 0 ? (
            <li className="px-5 py-12 text-center text-sm text-slate-500">
              No public results.
            </li>
          ) : null}
          {query === "" ? (
            <li className="px-5 py-12 text-center text-sm text-slate-500">
              Enter a search term.
            </li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
