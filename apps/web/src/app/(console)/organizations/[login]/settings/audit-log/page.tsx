import { notFound } from "next/navigation";
import { Clock, FileText, ShieldCheck } from "lucide-react";

import { queryAuditRecords } from "@/modules/platform/audit-storage/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { checkOrganizationContextEligibility } from "@/modules/organizations/organization-memberships/server-api";
import { getAccountReferenceById } from "@/modules/identity/accounts/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";

type AuditStorageRecord = Awaited<
  ReturnType<typeof queryAuditRecords>
>["records"][number];

function formatAuditTimestamp(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}

function renderMetadata(metadata: AuditStorageRecord["metadata"]): string {
  const keys = Object.keys(metadata);
  if (keys.length === 0) {
    return "no additional details";
  }

  return keys
    .sort()
    .map(
      (key) => `${key}: ${String(metadata[key])}`,
    )
    .join(", ");
}

export default async function OrganizationAuditLogPage({
  params,
}: Readonly<{ params: Promise<{ login: string }> }>) {
  const session = await requireCurrentSession();
  const routeParams = await params;
  const organization = await getOrganizationByLogin(routeParams.login);

  if (organization.status !== "found") {
    notFound();
  }

  const eligibility = await checkOrganizationContextEligibility({
    accountId: session.account.accountId,
    organizationId: organization.organization.organizationId,
  });

  if (eligibility.status !== "eligible") {
    notFound();
  }

  const recordsResult = await queryAuditRecords({
    scopeKind: "organization",
    scopeId: organization.organization.organizationId,
    limit: 200,
  });

  const rows = await Promise.all(
    recordsResult.records.map(async (record) => {
      const actorId = record.actorId;
      const actorLabel =
        actorId === null
          ? "system"
          : (async () => {
              const result = await getAccountReferenceById(actorId);
              return result.status === "found"
                ? `@${result.account.username}`
                : actorId;
            })();

      return {
        actorLabel: await actorLabel,
        occurredAt: formatAuditTimestamp(record.occurredAt),
        record,
      };
    }),
  );

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Organization settings · {organization.organization.login}
        </p>

        <div className="mt-3 flex items-start gap-4">
          <span
            aria-hidden="true"
            className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
          >
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              Organization audit log
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Review governance and administration actions captured for this
              organization.
            </p>
          </div>
        </div>

        <div className="mt-9 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-medium text-slate-300">
                Organization events
              </h2>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Clock className="size-3.5" aria-hidden="true" />
                Sorted newest first
              </span>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              <div className="inline-flex items-center justify-center gap-2 text-slate-400">
                <FileText className="size-4" aria-hidden="true" />
                No organization audit records are currently available.
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-white/10" role="list">
              {rows.map((row) => (
                <li className="px-4 py-4 sm:px-5" key={row.record.recordId}>
                  <div className="grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)_1.5fr] sm:items-start">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                      {row.occurredAt}
                    </p>
                    <p className="font-medium text-slate-100">
                      {row.record.action}
                    </p>
                    <p className="text-sm text-slate-400">{row.actorLabel}</p>
                    <p className="text-sm text-slate-400">
                      {row.record.targetKind === null
                        ? "Target"
                        : `${row.record.targetKind}: ${row.record.targetId ?? "unknown"}`}
                      ; {renderMetadata(row.record.metadata)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
