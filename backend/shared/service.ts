import { Elysia } from 'elysia';
import { authPlugin, HttpError } from './auth';

/**
 * Base Elysia app shared by every microservice:
 *  - attaches the auth plugin (derives `user`)
 *  - normalizes errors into `{ success: false, error }` with the right status code
 */
export const createService = (name: string) =>
  new Elysia({ name: `service-${name}` })
    .onError(({ code, error, set }) => {
      if (error instanceof HttpError) {
        set.status = error.status;
        return { success: false, error: error.message };
      }
      if (code === 'VALIDATION') {
        set.status = 400;
        return { success: false, error: (error as Error).message };
      }
      if (code === 'NOT_FOUND') {
        set.status = 404;
        return { success: false, error: 'Resource not found' };
      }
      set.status = 500;
      console.error(`[${name}] error:`, error);
      return { success: false, error: (error as Error)?.message ?? 'Internal server error' };
    })
    .use(authPlugin);
