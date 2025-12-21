import { z } from 'zod';
import { logger } from './logger';

const envSchema = z.object({
  // Firebase Web SDK
  VITE_FIREBASE_API_KEY: z.string().min(1, 'Firebase API Key is required'),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase Auth Domain is required'),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required'),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase Storage Bucket is required'),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase Messaging Sender ID is required'),
  VITE_FIREBASE_APP_ID: z.string().min(1, 'Firebase App ID is required'),

  // Optional
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  VITE_FCM_VAPID_KEY: z.string().optional(),
  VITE_API_BASE: z.string().default('/api'),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

export function validateEnv(): Env {
  if (validatedEnv) return validatedEnv;

  try {
    validatedEnv = envSchema.parse({
      VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
      VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
      VITE_FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
      VITE_FCM_VAPID_KEY: import.meta.env.VITE_FCM_VAPID_KEY,
      VITE_API_BASE: import.meta.env.VITE_API_BASE,
    });

    logger.info('Environment variables validated successfully');
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(e => e.path.join('.')).join(', ');
      const errorMessage = `Missing or invalid environment variables: ${missingVars}`;
      
      logger.error('Environment validation failed', error, { missingVars });

      // Show user-friendly error in development
      if (import.meta.env.DEV) {
        document.body.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui; background: #f3f4f6;">
            <div style="max-width: 600px; background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
              <h1 style="color: #dc2626; margin-bottom: 1rem;">⚠️ Configuration Error</h1>
              <p style="color: #374151; margin-bottom: 1rem;">The application cannot start due to missing environment variables.</p>
              <details style="background: #fef2f2; padding: 1rem; border-radius: 0.5rem; border: 1px solid #fecaca;">
                <summary style="cursor: pointer; font-weight: 600; color: #991b1b;">Missing variables</summary>
                <pre style="margin-top: 0.5rem; color: #7f1d1d; overflow-x: auto;">${missingVars}</pre>
              </details>
              <p style="margin-top: 1rem; color: #6b7280; font-size: 0.875rem;">
                Please create a <code>.env</code> file based on <code>.env.example</code> and add the required variables.
              </p>
            </div>
          </div>
        `;
      }

      throw new Error(errorMessage);
    }
    throw error;
  }
}

export const env = validateEnv();
