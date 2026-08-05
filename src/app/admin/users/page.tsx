import { getAllAdmins } from '@/lib/db/repositories/admin';
import UserManager from './UserManager';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const admins = await getAllAdmins();

  return <UserManager admins={admins} />;
}
