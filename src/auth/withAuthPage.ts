import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { logger } from '@/app/lib/logger';

export interface AuthPageProps {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
}

export function withAuthPage<T extends AuthPageProps>(
  Component: React.ComponentType<T>,
  options: {
    redirectTo?: string;
    requireAuth?: boolean;
  } = {},
) {
  return async function AuthenticatedPage(props: T): Promise<React.ReactElement> {
    const { redirectTo = '/sign-in', requireAuth = true } = options;

    if (requireAuth) {
      const { userId } = await auth();

      if (!userId) {
        logger.info('Unauthenticated access attempt', {
          // path: props.params,
          // searchParams: props.searchParams,
        });

        redirect(redirectTo);
      }

      logger.info('Authenticated access', {
        userId,
        // path: props.params,
      });
    }

    return React.createElement(Component, props);
  };
}

// Helper function for server components that need auth
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    logger.warn('Authentication required but user not found');
    redirect('/sign-in');
  }

  return { userId };
}

// Helper function for server components that need optional auth
export async function getOptionalAuth() {
  const { userId } = await auth();
  return { userId };
}
