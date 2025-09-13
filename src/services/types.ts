// Common types for service layer

export type Ok<T> = { 
  ok: true; 
  data: T;
};

export type Err = { 
  ok: false; 
  error: { 
    code: string; 
    message: string; 
    cause?: unknown;
  };
};

export type Result<T> = Ok<T> | Err;

// Helper functions for creating results
export function ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}

export function err(code: string, message: string, cause?: unknown): Err {
  return { 
    ok: false, 
    error: { code, message, cause }
  };
}

// Helper function to handle async operations with proper error handling
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorCode: string,
  errorMessage: string
): Promise<Result<T>> {
  try {
    const data = await operation();
    return ok(data);
  } catch (cause) {
    return err(errorCode, errorMessage, cause);
  }
}
