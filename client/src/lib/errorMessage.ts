export function getErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    const maybeAxiosError = error as {
      response?: { data?: { error?: string; message?: string } };
      message?: string;
    };

    return (
      maybeAxiosError.response?.data?.error ||
      maybeAxiosError.response?.data?.message ||
      maybeAxiosError.message ||
      fallback
    );
  }

  return fallback;
}
