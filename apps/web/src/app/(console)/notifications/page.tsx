import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import {
  listNotifications,
  markNotificationRead,
} from "@/modules/engagement/notifications/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";

async function markReadAction(formData: FormData): Promise<never> {
  "use server";

  const session = await requireCurrentSession();
  await markNotificationRead({
    notificationId: readFormString(formData, "notificationId"),
    recipientAccountId: session.account.accountId,
  });
  revalidatePath("/notifications");
  redirect("/notifications");
}

export default async function NotificationsPage() {
  const session = await requireCurrentSession();
  const result = await listNotifications(session.account.accountId);
  const notifications =
    result.status === "found" ? result.notifications : [];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-4xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Personal inbox
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
          Notifications
        </h1>
        <ul className="mt-8 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          {notifications.map((notification) => (
            <li
              className={
                notification.state === "unread"
                  ? "bg-emerald-400/5 px-5 py-4"
                  : "px-5 py-4"
              }
              key={notification.notificationId}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <a
                    className="font-semibold text-white hover:text-emerald-200"
                    href={notification.subjectHref}
                  >
                    {notification.subjectLabel}
                  </a>
                  <p className="mt-1 text-sm text-slate-500">
                    {notification.repositoryLabel} · {notification.reason} ·{" "}
                    {notification.state}
                  </p>
                </div>
                {notification.state === "unread" ? (
                  <form action={markReadAction}>
                    <input
                      name="notificationId"
                      type="hidden"
                      value={notification.notificationId}
                    />
                    <button
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/5"
                      type="submit"
                    >
                      Mark read
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
          {notifications.length === 0 ? (
            <li className="px-5 py-12 text-center text-sm text-slate-500">
              No notifications.
            </li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
