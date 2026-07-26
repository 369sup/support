import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import {
  listAccountProjects,
  type ProjectItemStatus,
  updateProjectItemStatus,
} from "@/modules/collaboration/projects/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";

async function updateItemAction(formData: FormData): Promise<never> {
  "use server";

  const session = await requireCurrentSession();
  const requestedStatus = readFormString(formData, "status");
  let status: ProjectItemStatus = "backlog";
  if (requestedStatus === "done") {
    status = "done";
  } else if (requestedStatus === "in-progress") {
    status = "in-progress";
  }
  await updateProjectItemStatus({
    actorAccountId: session.account.accountId,
    itemId: readFormString(formData, "itemId"),
    projectId: readFormString(formData, "projectId"),
    status,
    updatedAt: new Date().toISOString(),
  });
  revalidatePath("/projects");
  redirect("/projects");
}

export default async function ProjectsPage() {
  const session = await requireCurrentSession();
  const result = await listAccountProjects(session.account.accountId);

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Personal workspace
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
          Projects
        </h1>
        <div className="mt-8 grid gap-6">
          {result.projects.map((project) => (
            <section
              className="rounded-xl border border-white/15 bg-[#0a1624]"
              key={project.projectId}
            >
              <header className="border-b border-white/10 px-5 py-4">
                <h2 className="font-semibold text-white">{project.title}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {project.description}
                </p>
              </header>
              <ul className="divide-y divide-white/10">
                {project.items.map((item) => (
                  <li
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                    key={item.itemId}
                  >
                    <span className="text-sm text-slate-200">{item.title}</span>
                    <form action={updateItemAction} className="flex gap-2">
                      <input
                        name="projectId"
                        type="hidden"
                        value={project.projectId}
                      />
                      <input
                        name="itemId"
                        type="hidden"
                        value={item.itemId}
                      />
                      <select
                        className="rounded-md border border-white/10 bg-[#08111d] px-2 py-1 text-xs"
                        defaultValue={item.status}
                        name="status"
                      >
                        <option value="backlog">Backlog</option>
                        <option value="in-progress">In progress</option>
                        <option value="done">Done</option>
                      </select>
                      <button
                        className="rounded-md border border-emerald-400/30 px-2.5 py-1 text-xs text-emerald-200"
                        type="submit"
                      >
                        Update
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {result.projects.length === 0 ? (
            <p className="rounded-xl border border-white/15 px-5 py-12 text-center text-sm text-slate-500">
              No projects owned by this account.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
