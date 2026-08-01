import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import { resolveRepositoryViewForActor } from "@/app/(resources)/_repository-view";
import {
  addComment,
  listConversationComments,
} from "@/modules/collaboration/conversations/server-api";
import { getRepositoryDiscussion } from "@/modules/collaboration/discussions/server-api";
import {
  reportContent,
  type ContentReportReason,
} from "@/modules/collaboration/moderation/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getRepositoryForViewing } from "@/modules/repositories/repositories/server-api";

async function resolveDiscussionAccess(
  owner: string,
  repositoryName: string,
  number: number,
) {
  const session = await requireCurrentSession();
  const repository = await resolveRepositoryViewForActor(
    session.account.accountId,
    owner,
    repositoryName,
    getRepositoryForViewing,
  );
  if (repository === null) {
    notFound();
  }
  const discussionResult = await getRepositoryDiscussion({
    number,
    repositoryId: repository.repositoryId,
  });
  if (discussionResult.status !== "found") {
    notFound();
  }
  return { discussion: discussionResult.discussion, repository, session };
}

function readTarget(formData: FormData) {
  return {
    number: Number(formData.get("number")),
    owner: readFormString(formData, "owner"),
    repository: readFormString(formData, "repository"),
  };
}

async function addCommentAction(formData: FormData): Promise<never> {
  "use server";

  const target = readTarget(formData);
  const { discussion, repository, session } = await resolveDiscussionAccess(
    target.owner,
    target.repository,
    target.number,
  );
  if (repository.lifecycleState !== "active") {
    redirect(
      `/${target.owner}/${target.repository}/discussions/${target.number}?repository=archived-read-only`,
    );
  }
  const result = await addComment({
    actorAccountId: session.account.accountId,
    actorUsername: session.account.username,
    body: readFormString(formData, "body"),
    createdAt: new Date().toISOString(),
    subjectId: discussion.discussionId,
    subjectKind: "discussion",
  });
  const path = `/${target.owner}/${target.repository}/discussions/${target.number}`;
  revalidatePath(path);
  redirect(
    `/${target.owner}/${target.repository}/discussions/${target.number}?comment=${result.status}`,
  );
}

async function reportCommentAction(formData: FormData): Promise<never> {
  "use server";

  const target = readTarget(formData);
  const { session } = await resolveDiscussionAccess(
    target.owner,
    target.repository,
    target.number,
  );
  const requestedReason = readFormString(formData, "reason");
  let reason: ContentReportReason = "spam";
  if (requestedReason === "abuse" || requestedReason === "off-topic") {
    reason = requestedReason;
  }
  const result = await reportContent({
    createdAt: new Date().toISOString(),
    reason,
    reporterAccountId: session.account.accountId,
    targetId: readFormString(formData, "commentId"),
    targetKind: "comment",
  });
  redirect(
    `/${target.owner}/${target.repository}/discussions/${target.number}?report=${result.status}`,
  );
}

function TargetFields({
  number,
  owner,
  repository,
}: Readonly<{ number: number; owner: string; repository: string }>) {
  return (
    <>
      <input name="number" type="hidden" value={number} />
      <input name="owner" type="hidden" value={owner} />
      <input name="repository" type="hidden" value={repository} />
    </>
  );
}

export default async function DiscussionPage({
  params,
}: Readonly<{
  params: Promise<{ number: string; owner: string; repository: string }>;
}>) {
  const routeParams = await params;
  const number = Number(routeParams.number);
  const { discussion, repository } = await resolveDiscussionAccess(
    routeParams.owner,
    routeParams.repository,
    number,
  );
  const isReadOnly = repository.lifecycleState === "archived";
  const commentsResult = await listConversationComments({
    subjectId: discussion.discussionId,
    subjectKind: "discussion",
  });
  const comments =
    commentsResult.status === "found" ? commentsResult.comments : [];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          {routeParams.owner}/{routeParams.repository} · Discussion #
          {discussion.number}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
          {discussion.title}
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          {discussion.category} · {discussion.state} · @
          {discussion.authorUsername}
        </p>
        <article className="mt-7 whitespace-pre-wrap rounded-xl border border-white/15 bg-[#0a1624] px-5 py-6 leading-7 text-slate-200">
          {discussion.body}
        </article>
        <section className="mt-8">
          <h2 className="text-xl font-semibold">
            Conversation ({comments.length})
          </h2>
          <ul className="mt-4 grid gap-4">
            {comments.map((comment) => (
              <li
                className="rounded-xl border border-white/15 bg-[#0a1624]"
                key={comment.commentId}
              >
                <header className="border-b border-white/10 px-4 py-3 text-sm text-slate-400">
                  @{comment.authorUsername}
                </header>
                <p className="whitespace-pre-wrap px-4 py-5 text-slate-200">
                  {comment.body}
                </p>
                <form
                  action={reportCommentAction}
                  className="flex items-center gap-2 border-t border-white/10 px-4 py-3"
                >
                  <TargetFields
                    number={number}
                    owner={routeParams.owner}
                    repository={routeParams.repository}
                  />
                  <input
                    name="commentId"
                    type="hidden"
                    value={comment.commentId}
                  />
                  <select
                    className="rounded-md border border-white/10 bg-[#08111d] px-2 py-1 text-xs"
                    name="reason"
                  >
                    <option value="spam">Spam</option>
                    <option value="abuse">Abuse</option>
                    <option value="off-topic">Off-topic</option>
                  </select>
                  <button className="text-xs text-slate-400" type="submit">
                    Report
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <form action={addCommentAction} className="mt-6 grid gap-3">
            <TargetFields
              number={number}
              owner={routeParams.owner}
              repository={routeParams.repository}
            />
            <label className="grid gap-2 text-sm font-medium text-slate-200">
              Add a comment
              <textarea
                className="min-h-32 rounded-lg border border-white/15 bg-[#08111d] px-3 py-2.5"
                disabled={isReadOnly}
                name="body"
                required
              />
            </label>
            <button
              className="w-fit rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950"
              disabled={isReadOnly}
              type="submit"
            >
              Comment
            </button>
            {isReadOnly ? (
              <p className="text-sm text-amber-200">
                Archived repositories are read-only. Existing discussions
                remain available for reference.
              </p>
            ) : null}
          </form>
        </section>
      </section>
    </main>
  );
}
