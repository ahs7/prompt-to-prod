import "server-only";

export class ScanError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly userMessage: string
  ) {
    super(message);
    this.name = "ScanError";
  }
}

const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^0\./,
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,
  /^fd[0-9a-f]{2}:/i,
];

function isPrivateHost(hostname: string): boolean {
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(hostname));
}

/**
 * Normalizes and validates a URL for scanning.
 * - Adds https:// if scheme is missing
 * - Rejects non-HTTP(S) schemes
 * - Rejects localhost/private IP ranges
 * Returns the normalized URL string or throws a ScanError.
 */
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();

  if (!trimmed) {
    throw new ScanError(
      "Empty URL provided",
      "EMPTY_URL",
      "Please enter a URL to scan."
    );
  }

  // Add https:// if no scheme provided
  let urlString = trimmed;
  if (!/^https?:\/\//i.test(urlString)) {
    urlString = `https://${urlString}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new ScanError(
      `Invalid URL: ${urlString}`,
      "INVALID_URL",
      "That doesn't look like a valid URL. Try something like https://yoursite.com"
    );
  }

  // Only allow HTTP and HTTPS
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new ScanError(
      `Invalid protocol: ${parsed.protocol}`,
      "INVALID_PROTOCOL",
      "Only http:// and https:// URLs can be scanned."
    );
  }

  // Reject private/internal hostnames
  if (isPrivateHost(parsed.hostname)) {
    throw new ScanError(
      `Private hostname: ${parsed.hostname}`,
      "PRIVATE_URL",
      "Private or local URLs can't be scanned. Use a public URL."
    );
  }

  // Reject empty hostname (e.g., "https://")
  if (!parsed.hostname || parsed.hostname === "") {
    throw new ScanError(
      "Missing hostname",
      "MISSING_HOSTNAME",
      "Please enter a complete URL including the domain name."
    );
  }

  return parsed.toString();
}
