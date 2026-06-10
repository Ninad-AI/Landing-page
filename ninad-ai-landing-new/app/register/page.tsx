import { redirect } from 'next/navigation';

/**
 * /register is no longer used.
 * Google Sign-In (POST /auth/google) handles both login AND account creation
 * in a single step — the backend creates or updates the user automatically.
 */
export default function RegisterPage() {
  redirect('/login');
}
