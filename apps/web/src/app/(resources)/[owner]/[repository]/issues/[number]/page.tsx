import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import { resolveRepositoryViewForActor } from "@/app/(resources)/_repository-view";
import {
  addComment,
  addReaction,
  listConversationComments,
  type ConversationReaction,
} from "@/modules/collaboration/conversations/server-api";
import { getRepositoryIssue } from "@/modules/collaboration/issues/server-api";
import {
  reportContent,
  type ContentReportReason,
} from "@/modules/collaboration/moderation/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getRepositoryForViewing } from "@/modules/repositories/repositories/server-api";

async function resolveIssueAccess(
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
  const issueResult = await getRepositoryIssue({
    repositoryId: repository.repositoryId,
    number,
  });
  if (issueResult.status !== "found") {
    notFound();
  }
  return { session, repository, issue: issueResult.issue };
}

function readIssueActionTarget(formData: FormData) {
  return {
    owner: readFormString(formData, "owner"),
    repository: readFormString(formData, "repository"),
    number: Number(formData.get("number")),
  };
}

async function addCommentAction(formData: FormData): Promise<never> {
  "use server";

  const target = readIssueActionTarget(formData);
  const { session, repository, issue } = await resolveIssueAccess(
    target.owner,
    target.repository,
    target.number,
  );
  if (repository.lifecycleState !== "active") {
    redirect(
      `/${target.owner}/${target.repository}/issues/${target.number}?repository=archived-read-only`,
    );
  }
  const result = await addComment({
    subjectKind: "issue",
    subjectId: issue.issueId,
    actorAccountId: session.account.accountId,
    actorUsername: session.account.username,
    body: readFormString(formData, "body"),
    createdAt: new Date().toISOString(),
  });
  const path = `/${target.owner}/${target.repository}/issues/${target.number}`;
  if (result.status !== "added") {
    redirect(
      `/${target.owner}/${target.repository}/issues/${target.number}?comment=${result.status}`,
    );
  }
  revalidatePath(path);
  redirect(
    `/${target.owner}/${target.repository}/issues/${target.number}?comment=added`,
  );
}

async function addReactionAction(formData: FormData): Promise<never> {
  "use server";

  const target = readIssueActionTarget(formData);
  const { session, repository, issue } = await resolveIssueAccess(
    target.owner,
    target.repository,
    target.number,
  );
  if (repository.lifecycleState !== "active") {
    redirect(
      `/${target.owner}/${target.repository}/issues/${target.number}?repository=archived-read-only`,
    );
  }
  const requestedReaction = readFormString(formData, "reaction");
  let reaction: ConversationReaction = "thumbs-up";
  if (
    requestedReaction === "heart" ||
    requestedReaction === "hooray" ||
    requestedReaction === "eyes"
  ) {
    reaction = requestedReaction;
  }
  const result = await addReaction({
    subjectId: issue.issueId,
    commentId: readFormString(formData, "commentId"),
    actorAccountId: session.account.accountId,
    reaction,
  });
  const path = `/${target.owner}/${target.repository}/issues/${target.number}`;
  revalidatePath(path);
  redirect(
    `/${target.owner}/${target.repository}/issues/${target.number}?reaction=${result.status}`,
  );
}

async function reportIssueAction(formData: FormData): Promise<never> {
  "use server";

  const target = readIssueActionTarget(formData);
  const { session, issue } = await resolveIssueAccess(
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
    reporterAccountId: session.account.accountId,
    targetKind: "issue",
    targetId: issue.issueId,
    reason,
    createdAt: new Date().toISOString(),
  });
  redirect(
    `/${target.owner}/${target.repository}/issues/${target.number}?report=${result.status}`,
  );
}

function ActionTargetFields({
  number,
  owner,
  repository,
}: Readonly<{ number: number; owner: string; repository: string }>) {
  return (
    <>
      <input name="owner" type="hidden" value={owner} />
      <input name="repository" type="hidden" value={repository} />
      <input name="number" type="hidden" value={number} />
    </>
  );
}

export default async function IssuePage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ owner: string; repository: string; number: string }>;
  searchParams: Promise<{
    comment?: string;
    reaction?: string;
    report?: string;
  }>;
}>) {
  const [routeParams, query] = await Promise.all([params, searchParams]);
  const number = Number(routeParams.number);
  const { issue, repository } = await resolveIssueAccess(
    routeParams.owner,
    routeParams.repository,
    number,
  );
  const isReadOnly = repository.lifecycleState === "archived";
  const commentsResult = await listConversationComments({
    subjectKind: "issue",
    subjectId: issue.issueId,
  });
  const comments =
    commentsResult.status === "found" ? commentsResult.comments : [];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          {routeParams.owner}/{routeParams.repository} · Issue #{issue.number}
        </p>
        <div className="mt-3 flex flex-wrap items-start gap-3">
          <h1 className="min-w-0 flex-1 text-4xl font-semibold tracking-[-0.04em]">
            {issue.title}
          </h1>
          <span
            className={
              issue.state === "open"
                ? "rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200"
                : "rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-200"
            }
          >
            {issue.state}
          </span>
        </div>

        <article className="mt-7 rounded-xl border border-white/15 bg-[#0a1624]">
          <header className="border-b border-white/10 px-5 py-3 text-sm text-slate-400">
            @{issue.authorUsername} opened this issue
          </header>
          <p className="whitespace-pre-wrap px-5 py-6 leading-7 text-slate-200">
            {issue.body}
          </p>
        </article>

        {query.report === "reported" ? (
          <p
            className="mt-5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"
            role="status"
          >
            Report submitted for moderator review.
          </p>
        ) : null}

        <section className="mt-8" aria-labelledby="conversation-heading">
          <h2 className="text-xl font-semibold" id="conversation-heading">
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
                  action={addReactionAction}
                  className="border-t border-white/10 px-4 py-3"
                >
                  <ActionTargetFields
                    number={number}
                    owner={routeParams.owner}
                    repository={routeParams.repository}
                  />
                  <input
                    name="commentId"
                    type="hidden"
                    value={comment.commentId}
                  />
                  <button
                    className="rounded-md border border-white/15 px-2.5 py-1 text-xs text-slate-300 hover:border-emerald-400/50"
                    disabled={isReadOnly}
                    name="reaction"
                    type="submit"
                    value="thumbs-up"
                  >
                    👍 {comment.reactions["thumbs-up"]}
                  </button>
                </form>
              </li>
            ))}
          </ul>

          <form action={addCommentAction} className="mt-6 grid gap-3">
            <ActionTargetFields
              number={number}
              owner={routeParams.owner}
              repository={routeParams.repository}
            />
            <label className="text-sm font-medium" htmlFor="issue-comment">
              Add a comment
            </label>
            <textarea
              className="min-h-32 resize-y rounded-lg border border-white/15 bg-[#08111d] px-3 py-2.5 outline-none focus:border-emerald-400"
              disabled={isReadOnly}
              id="issue-comment"
              name="body"
              required
            />
            <button
              className="w-fit rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
              disabled={isReadOnly}
              type="submit"
            >
              Comment
            </button>
            {isReadOnly ? (
              <p className="text-sm text-amber-200">
                Archived repositories are read-only. Existing issues remain
                available for reference.
              </p>
            ) : null}
          </form>
        </section>

        <section className="mt-10 border-t border-white/10 pt-7">
          <h2 className="text-sm font-semibold text-slate-300">
            Report this issue
          </h2>
          <form action={reportIssueAction} className="mt-3 flex flex-wrap gap-3">
            <ActionTargetFields
              number={number}
              owner={routeParams.owner}
              repository={routeParams.repository}
            />
            <select
              className="rounded-lg border border-white/15 bg-[#08111d] px-3 py-2 text-sm"
              name="reason"
            >
              <option value="abuse">Abuse</option>
              <option value="spam">Spam</option>
              <option value="off-topic">Off-topic</option>
            </select>
            <button
              className="rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-200 hover:bg-red-400/10"
              type="submit"
            >
              Submit report
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
