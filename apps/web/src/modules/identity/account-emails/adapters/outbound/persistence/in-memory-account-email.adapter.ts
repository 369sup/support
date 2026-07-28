import type { AccountEmailRepositoryPort } from "../../../application/ports/outbound/account-email.repository.port";
import type {
  AccountEmail,
  EmailVerification,
  OrganizationNotificationRoute,
} from "../../../domain/account-email";

type AccountEmailStore = {
  emails: Map<string, AccountEmail>;
  quarantineByAddress: Map<string, string>;
  routes: Map<string, OrganizationNotificationRoute>;
  verifications: Map<string, EmailVerification>;
};

declare global {
  var __supportAccountEmailStoreV1: AccountEmailStore | undefined;
}

function getProcessStore(): AccountEmailStore {
  globalThis.__supportAccountEmailStoreV1 ??= {
    emails: new Map(),
    quarantineByAddress: new Map(),
    routes: new Map(),
    verifications: new Map(),
  };
  return globalThis.__supportAccountEmailStoreV1;
}

export class InMemoryAccountEmailAdapter
  implements AccountEmailRepositoryPort
{
  private readonly store: AccountEmailStore;

  constructor(store: AccountEmailStore = getProcessStore()) {
    this.store = store;
  }

  add(email: AccountEmail): Promise<
    | Readonly<{ status: "added" }>
    | Readonly<{
        status:
          | "account-email-limit"
          | "email-already-owned"
          | "email-quarantined";
      }>
  > {
    const hasOwner = [...this.store.emails.values()].some(
      (candidate) => candidate.address === email.address,
    );
    if (hasOwner) {
      return Promise.resolve({ status: "email-already-owned" });
    }
    const quarantineUntil = this.store.quarantineByAddress.get(
      email.address,
    );
    if (
      quarantineUntil !== undefined &&
      Date.parse(quarantineUntil) > Date.now()
    ) {
      return Promise.resolve({ status: "email-quarantined" });
    }
    const accountEmailCount = [...this.store.emails.values()].filter(
      (candidate) => candidate.accountId === email.accountId,
    ).length;
    if (accountEmailCount >= 10) {
      return Promise.resolve({ status: "account-email-limit" });
    }
    this.store.emails.set(email.emailId, { ...email });
    return Promise.resolve({ status: "added" });
  }

  findByAddress(address: string): Promise<AccountEmail | null> {
    return Promise.resolve(
      [...this.store.emails.values()].find(
        (email) => email.address === address,
      ) ?? null,
    );
  }

  findById(emailId: string): Promise<AccountEmail | null> {
    return Promise.resolve(this.store.emails.get(emailId) ?? null);
  }

  findVerificationByTokenHash(
    tokenHash: string,
  ): Promise<EmailVerification | null> {
    return Promise.resolve(
      this.store.verifications.get(tokenHash) ?? null,
    );
  }

  listByAccount(accountId: string): Promise<readonly AccountEmail[]> {
    return Promise.resolve(
      [...this.store.emails.values()]
        .filter((email) => email.accountId === accountId)
        .sort((left, right) =>
          left.createdAt.localeCompare(right.createdAt),
        ),
    );
  }

  remove(
    emailId: string,
    quarantineUntil: string,
  ): Promise<boolean> {
    const email = this.store.emails.get(emailId);
    if (email === undefined) {
      return Promise.resolve(false);
    }
    this.store.emails.delete(emailId);
    this.store.quarantineByAddress.set(
      email.address,
      quarantineUntil,
    );
    for (const [routeId, route] of this.store.routes) {
      if (route.emailId === emailId) {
        this.store.routes.delete(routeId);
      }
    }
    return Promise.resolve(true);
  }

  saveOrganizationNotificationRoute(
    route: OrganizationNotificationRoute,
  ): Promise<void> {
    this.store.routes.set(
      `${route.organizationId}:${route.accountId}`,
      { ...route },
    );
    return Promise.resolve();
  }

  saveVerification(
    verification: EmailVerification,
  ): Promise<void> {
    this.store.verifications.set(verification.tokenHash, {
      ...verification,
    });
    return Promise.resolve();
  }

  setPrimary(accountId: string, emailId: string): Promise<boolean> {
    const selected = this.store.emails.get(emailId);
    if (selected === undefined || selected.accountId !== accountId) {
      return Promise.resolve(false);
    }
    for (const [candidateId, candidate] of this.store.emails) {
      if (candidate.accountId === accountId) {
        this.store.emails.set(candidateId, {
          ...candidate,
          isPrimary: candidate.emailId === emailId,
        });
      }
    }
    return Promise.resolve(true);
  }

  setPublic(
    accountId: string,
    emailId: string | null,
  ): Promise<boolean> {
    if (emailId !== null) {
      const selected = this.store.emails.get(emailId);
      if (selected === undefined || selected.accountId !== accountId) {
        return Promise.resolve(false);
      }
    }
    for (const [candidateId, candidate] of this.store.emails) {
      if (candidate.accountId === accountId) {
        this.store.emails.set(candidateId, {
          ...candidate,
          isPublic: candidate.emailId === emailId,
        });
      }
    }
    return Promise.resolve(true);
  }

  verify(emailId: string, tokenHash: string): Promise<boolean> {
    const verification = this.store.verifications.get(tokenHash);
    const email = this.store.emails.get(emailId);
    if (verification === undefined || email === undefined) {
      return Promise.resolve(false);
    }
    this.store.emails.set(emailId, { ...email, isVerified: true });
    this.store.verifications.delete(tokenHash);
    return Promise.resolve(true);
  }
}
