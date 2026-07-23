export function hasSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin === null || host === null) {
    return false;
  }

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",", 1)[0]
    ?.trim();
  const requestProtocol =
    forwardedProtocol === undefined
      ? new URL(request.url).protocol
      : `${forwardedProtocol}:`;

  return originUrl.host === host && originUrl.protocol === requestProtocol;
}
