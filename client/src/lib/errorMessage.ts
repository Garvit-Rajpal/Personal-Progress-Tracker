/**
 * Pull a human-readable message out of whatever the API returned.
 *
 * Two server shapes are live at once during V2 (ADR-14): the M0-4 envelope
 * `{ error: { code, message, details } }` on converted routes, and V1's bare
 * `{ error: "..." }` everywhere else. Both are handled here so a route's
 * conversion is invisible to the pages that call it.
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    const maybeAxiosError = error as {
      response?: {
        data?: {
          error?: string | { code?: string; message?: string; details?: Array<{ message?: string }> };
          message?: string;
        };
      };
      message?: string;
    };

    const payload = maybeAxiosError.response?.data?.error;

    if (typeof payload === 'string') return payload;

    if (payload && typeof payload === 'object') {
      // A validation failure is far more useful as the field complaints than
      // as the generic "Request validation failed".
      const details = payload.details
        ?.map((d) => d?.message)
        .filter((m): m is string => Boolean(m));

      if (details?.length) return details.join('. ');
      if (payload.message) return payload.message;
    }

    return maybeAxiosError.response?.data?.message || maybeAxiosError.message || fallback;
  }

  return fallback;
}
