import type { Route } from "next";
import { notFound } from "next/navigation";

import {
  routeDefinitions,
  type NavigableRouteId,
  type RouteDefinition,
  type RouteId,
  type RouteParamsById,
  type RouteQueryById,
  type UnavailableRouteId,
} from "./route-contracts.generated";

type UnknownRecord = Readonly<Record<string, unknown>>;

function isUnknownRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireRecord(value: unknown, label: string): UnknownRecord {
  if (!isUnknownRecord(value)) {
    throw new TypeError(`${label} must be an object.`);
  }

  return value;
}

function encodeScalarSegment(
  routeId: RouteId,
  parameterName: string,
  value: unknown,
): string {
  if (typeof value !== "string" || value.length === 0 || value.includes("/")) {
    throw new TypeError(
      `${routeId} path parameter ${parameterName} must be one non-empty segment.`,
    );
  }

  return encodeURIComponent(value);
}

function encodeCatchAllSegments(
  routeId: RouteId,
  parameterName: string,
  value: unknown,
  isOptional: boolean,
): string {
  if (
    !Array.isArray(value) ||
    (!isOptional && value.length === 0) ||
    value.some(
      (segment) =>
        typeof segment !== "string" ||
        segment.length === 0,
    )
  ) {
    throw new TypeError(
      `${routeId} path parameter ${parameterName} must be ${isOptional ? "an" : "a non-empty"} array of individual segments.`,
    );
  }

  const encoded = [];

  for (const segment of value) {
    if (typeof segment === "string") {
      encoded.push(encodeURIComponent(segment));
    }
  }

  return encoded.join("/");
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) &&
    value.every((item: unknown) => typeof item === "string");
}

function isAppRoute(value: string): value is Route {
  return value.startsWith("/") && !value.startsWith("//");
}

function appendQuery(
  routeId: RouteId,
  path: string,
  query: UnknownRecord,
): string {
  const definition: RouteDefinition = routeDefinitions[routeId];
  const allowed = new Map(
    definition.queryParams.map((parameter) => [parameter.name, parameter]),
  );

  for (const key of Object.keys(query)) {
    if (!allowed.has(key)) {
      throw new TypeError(`${routeId} does not declare query parameter ${key}.`);
    }
  }

  const search = new URLSearchParams();

  for (const [key, schema] of [...allowed].sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    const supplied = query[key];
    const value = supplied === undefined ? schema.default : supplied;

    if (value === undefined) {
      if (schema.isRequired) {
        throw new TypeError(`${routeId} requires query parameter ${key}.`);
      }
      continue;
    }

    let values: string[] | undefined;

    if (typeof value === "string") {
      values = [value];
    } else if (isStringArray(value)) {
      values = [...value];
    }

    if (values === undefined) {
      throw new TypeError(`${routeId} query parameter ${key} must be a string.`);
    }

    if (!schema.isRepeatable && values.length !== 1) {
      throw new TypeError(`${routeId} query parameter ${key} is not repeatable.`);
    }

    for (const item of [...values].sort()) {
      search.append(key, item);
    }
  }

  const serialized = search.toString();
  return serialized === "" ? path : `${path}?${serialized}`;
}

export function getRouteDefinition<T extends RouteId>(
  routeId: T,
): (typeof routeDefinitions)[T] {
  return routeDefinitions[routeId];
}

export function buildAppPath<T extends RouteId>(
  routeId: T,
  params: RouteParamsById[T],
  query?: RouteQueryById[T],
): string {
  const definition: RouteDefinition = routeDefinitions[routeId];
  const suppliedParams = requireRecord(params, `${routeId} params`);
  const allowedParams = new Set(
    definition.pathParams.map((parameter) => parameter.name),
  );

  for (const key of Object.keys(suppliedParams)) {
    if (!allowedParams.has(key)) {
      throw new TypeError(`${routeId} does not declare path parameter ${key}.`);
    }
  }

  let path = definition.supportPath;

  for (const schema of definition.pathParams) {
    const value = suppliedParams[schema.name];

    if (value === undefined) {
      throw new TypeError(
        `${routeId} requires path parameter ${schema.name}.`,
      );
    }

    if (schema.kind === "scalar") {
      path = path.replace(
        `{${schema.name}}`,
        encodeScalarSegment(routeId, schema.name, value),
      );
      continue;
    }

    const isOptional = schema.kind === "optional-catch-all";
    const placeholder = isOptional
      ? `{?*${schema.name}}`
      : `{*${schema.name}}`;
    const encoded = encodeCatchAllSegments(
      routeId,
      schema.name,
      value,
      isOptional,
    );
    path = path.replace(
      isOptional && encoded === "" ? `/${placeholder}` : placeholder,
      encoded,
    );
  }

  return appendQuery(
    routeId,
    path,
    requireRecord(query ?? {}, `${routeId} query`),
  );
}

export function buildLinkHref<T extends NavigableRouteId>(
  routeId: T,
  params: RouteParamsById[T],
  query?: RouteQueryById[T],
): Route {
  const definition: RouteDefinition = routeDefinitions[routeId];

  if (
    definition.kind !== "page" ||
    definition.materialization !== "active" ||
    (definition.status !== "active" && definition.status !== "mixed")
  ) {
    throw new TypeError(`${routeId} is not a navigable route.`);
  }

  const href = buildAppPath(routeId, params, query);

  if (!isAppRoute(href)) {
    throw new TypeError(`${routeId} did not produce an application route.`);
  }

  return href;
}

export function renderUnavailableRoute(
  routeId: UnavailableRouteId,
): never {
  const definition: RouteDefinition = routeDefinitions[routeId];

  if (definition.materialization === "active") {
    throw new TypeError(`${routeId} is active and cannot render unavailable.`);
  }

  notFound();
}
