export type EnterpriseAdministrationDecision =
  | Readonly<{
      status: "allowed";
      roleName: "enterprise-owner" | "enterprise-admin";
      permissions: readonly ["view-enterprise"];
    }>
  | Readonly<{
      status: "denied";
      reason: "membership-inactive" | "permission-missing";
    }>;
