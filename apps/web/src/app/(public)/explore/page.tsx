import { getExploreFeed } from "@/modules/projections/discovery/server-api";

export default async function ExplorePage() {
  const { feed } = await getExploreFeed();

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-6xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Public discovery
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
          Explore
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-slate-400">
          Deterministic development fixtures; no behavioral telemetry or
          opaque ranking is claimed.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section>
            <h2 className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
              Featured repositories
            </h2>
            <ul className="mt-3 grid gap-4">
              {feed.repositories.map((repository) => (
                <li
                  className="rounded-xl border border-white/15 bg-[#0a1624] p-5"
                  key={repository.href}
                >
                  <a
                    className="text-lg font-semibold text-white hover:text-emerald-200"
                    href={repository.href}
                  >
                    {repository.label}
                  </a>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {repository.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {repository.topics.map((topic) => (
                      <span
                        className="rounded-full bg-sky-400/10 px-2.5 py-1 text-xs text-sky-200"
                        key={topic}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <aside className="space-y-6">
            <section className="rounded-xl border border-white/15 bg-[#0a1624] p-5">
              <h2 className="font-semibold text-white">Topics</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {feed.topics.map((topic) => (
                  <span
                    className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300"
                    key={topic}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </section>
            {feed.collections.map((collection) => (
              <section
                className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-5"
                key={collection.title}
              >
                <h2 className="font-semibold text-amber-100">
                  {collection.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {collection.description}
                </p>
              </section>
            ))}
          </aside>
        </div>
      </section>
    </main>
  );
}
