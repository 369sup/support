import {
  architectureRuleRegistry,
  isArchitectureProfile,
} from "@support/tooling/architecture/policy";

export function assertArchitectureProfile(profile) {
  if (!isArchitectureProfile(profile)) {
    throw new Error(
      `Invalid architecture profile ${profile}. Expected required, generated, knowledge, or all.`,
    );
  }
}

export function toViolation(value, expectedGate) {
  const match = /^\[([A-Z]+(?:-[A-Z]+)*-\d{3})\]\s*(.*)$/.exec(value);
  if (match === null) {
    throw new Error(`Architecture diagnostic is missing a rule ID: ${value}`);
  }

  const ruleId = match[1];
  const policy = architectureRuleRegistry[ruleId];
  if (policy === undefined) {
    throw new Error(`Architecture diagnostic uses unregistered rule ID ${ruleId}.`);
  }
  if (policy.gate !== expectedGate) {
    throw new Error(
      `Architecture diagnostic ${ruleId} was reported as ${expectedGate}, but policy assigns ${policy.gate}.`,
    );
  }

  return Object.freeze({
    ruleId,
    gate: policy.gate,
    category: policy.category,
    message: match[2],
  });
}

export function selectViolations({
  generatedErrors,
  knowledgeErrors,
  profile,
  requiredErrors,
}) {
  const violations = [
    ...requiredErrors.map((error) => toViolation(error, "required")),
    ...generatedErrors.map((error) => toViolation(error, "generated")),
    ...knowledgeErrors.map((error) => toViolation(error, "knowledge")),
  ];

  if (profile === "all") {
    return violations;
  }

  return violations.filter((violation) => violation.gate === profile);
}
