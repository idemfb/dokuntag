import { NextResponse } from 'next/server';
import { formatErrorResponse, getErrorStatus, isLoyaltyError } from './errors';
import { logError } from './logger';

export function withErrorHandler(handler: (req: any) => Promise<Response | ReturnType<typeof NextResponse.json>>) {
  return async function (req: any) {
    try {
      // Delegate to original handler
      const result = await handler(req);
      return result as any;
    } catch (err: unknown) {
      // Log full error with stack when available for debugging
      if (err instanceof Error) {
        logError('UNHANDLED_API_ERROR', { message: err.message, stack: err.stack });
      } else {
        logError('UNHANDLED_API_ERROR', { err });
      }

      const formatted = formatErrorResponse(err);
      const status = getErrorStatus(err);

      // Include context for LoyaltyError in dev mode for debugging
      const isDev = process.env.NODE_ENV !== 'production';
      const responseBody: any = { success: false, error: formatted.message, code: formatted.code };
      
      if (isDev && isLoyaltyError(err) && (err as any).context) {
        responseBody.context = (err as any).context;
      }

      return NextResponse.json(responseBody, { status });
    }
  };
}
