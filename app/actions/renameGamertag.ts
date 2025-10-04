'use server';

import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

const renameGamertagSchema = z.string().min(3).max(16); // Example schema

export async function renameGamertag(newGamertag: string) {
  const user = await currentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validatedGamertag = renameGamertagSchema.parse(newGamertag);

  // In a real application, you'd add more robust logic here:
  // - Check if gamertag is already taken
  // - Rate limit changes (e.g., once per year)
  // - Update in your database
  // For now, we'll just simulate a successful update.

  // User attempting to rename gamertag

  // Simulate database update
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

  // Update user metadata in Clerk (optional, but good for consistency)
  // Note: user.update() is not available in server actions
  // This would need to be handled through Clerk's server-side API
  // Would update user gamertag

  return { success: true, newGamertag: validatedGamertag };
}
