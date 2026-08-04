import { getDb } from '@/lib/db';
import { contactMessages } from '@/lib/db/schema';

export async function createContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const db = getDb();
  await db.insert(contactMessages).values({
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
  });
}
