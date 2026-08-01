"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SyntheticEvent } from "react";

import type { TotpEnrollmentResult } from "../../../contracts/supabase-mfa";

type Enrollment = Extract<TotpEnrollmentResult, { status: "enrolled" }>;

function isEnrollment(payload: unknown): payload is Enrollment {
  return (
    payload !== null &&
    typeof payload === "object" &&
    "status" in payload &&
    payload.status === "enrolled" &&
    "factorId" in payload &&
    typeof payload.factorId === "string" &&
    "qrCode" in payload &&
    typeof payload.qrCode === "string" &&
    "secret" in payload &&
    typeof payload.secret === "string"
  );
}

function readStatus(payload: unknown): string | null {
  return payload !== null &&
    typeof payload === "object" &&
    "status" in payload &&
    typeof payload.status === "string"
    ? payload.status
    : null;
}

function toQrImageSource(qrCode: string): string | null {
  if (qrCode.startsWith("data:image/")) {
    return qrCode;
  }
  if (qrCode.trimStart().startsWith("<svg")) {
    return `data:image/svg+xml,${encodeURIComponent(qrCode)}`;
  }
  return null;
}

export function TotpEnrollmentManager() {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<Enrollment>();
  const [message, setMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  async function performEnrollment(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    setIsPending(true);
    setMessage(undefined);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/mfa", {
      body: JSON.stringify({
        friendlyName: formData.get("friendlyName"),
        operation: "enroll",
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const payload: unknown = await response.json().catch(() => null);
    if (
      response.ok &&
      isEnrollment(payload)
    ) {
      setEnrollment(payload);
      setMessage(
        "Scan the QR code, then enter a current code to finish enrollment.",
      );
    } else {
      setMessage(
        readStatus(payload) === "invalid-factor"
          ? "Choose a non-empty authenticator name."
          : "Supabase could not start TOTP enrollment.",
      );
    }
    setIsPending(false);
  }

  function handleEnroll(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ): void {
    void performEnrollment(event);
  }

  async function performVerification(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    if (enrollment === undefined) {
      return;
    }
    setIsPending(true);
    setMessage(undefined);
    const formData = new FormData(event.currentTarget);
    const challengeResponse = await fetch("/api/auth/mfa", {
      body: JSON.stringify({
        factorId: enrollment.factorId,
        operation: "challenge",
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const challenge: unknown = await challengeResponse
      .json()
      .catch(() => null);
    if (
      !challengeResponse.ok ||
      challenge === null ||
      typeof challenge !== "object" ||
      !("status" in challenge) ||
      challenge.status !== "challenged" ||
      !("challengeId" in challenge) ||
      typeof challenge.challengeId !== "string"
    ) {
      setMessage("Supabase could not challenge this authenticator factor.");
      setIsPending(false);
      return;
    }
    const verifyResponse = await fetch("/api/auth/mfa", {
      body: JSON.stringify({
        challengeId: challenge.challengeId,
        code: formData.get("code"),
        factorId: enrollment.factorId,
        operation: "verify",
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const verified: unknown = await verifyResponse.json().catch(() => null);
    if (verifyResponse.ok && readStatus(verified) === "updated") {
      setEnrollment(undefined);
      setMessage("Authenticator application verified.");
      router.refresh();
    } else {
      setMessage("The verification code was not accepted.");
    }
    setIsPending(false);
  }

  function handleVerify(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ): void {
    void performVerification(event);
  }

  const qrSource =
    enrollment === undefined
      ? null
      : toQrImageSource(enrollment.qrCode);

  return (
    <div className="mt-5 rounded-lg border border-white/10 bg-black/10 p-4">
      {enrollment === undefined ? (
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={handleEnroll}
        >
          <label className="grid min-w-60 flex-1 gap-2 text-sm font-medium text-slate-200">
            Authenticator name
            <input
              className="rounded-md border border-white/15 bg-[#08111d] px-3 py-2 text-white outline-none focus:border-emerald-400"
              defaultValue="Support"
              maxLength={64}
              name="friendlyName"
              required
            />
          </label>
          <button
            className="rounded-md bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            Enroll authenticator
          </button>
        </form>
      ) : (
        <div className="grid gap-5 sm:grid-cols-[12rem_minmax(0,1fr)]">
          {qrSource === null ? null : (
            <Image
              alt="TOTP enrollment QR code"
              className="rounded-md bg-white p-2"
              height={192}
              src={qrSource}
              unoptimized
              width={192}
            />
          )}
          <div>
            <p className="text-sm font-medium text-slate-100">
              Manual setup secret
            </p>
            <code className="mt-2 block break-all rounded-md bg-black/30 p-3 text-sm text-emerald-200">
              {enrollment.secret}
            </code>
            <form
              className="mt-4 flex flex-wrap gap-3"
              onSubmit={handleVerify}
            >
              <label className="grid flex-1 gap-2 text-sm font-medium text-slate-200">
                Six-digit code
                <input
                  autoComplete="one-time-code"
                  className="rounded-md border border-white/15 bg-[#08111d] px-3 py-2 text-white outline-none focus:border-emerald-400"
                  inputMode="numeric"
                  name="code"
                  pattern="[0-9]{6}"
                  required
                />
              </label>
              <button
                className="self-end rounded-md bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-60"
                disabled={isPending}
                type="submit"
              >
                Verify
              </button>
            </form>
          </div>
        </div>
      )}
      {message === undefined ? null : (
        <p className="mt-3 text-sm text-slate-300" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
