// Who can access the admin panel.
// IMPORTANT: keep this list in sync with the public.is_admin() SQL function.
export const ADMIN_EMAILS = [
  "lazzyproducer09@gmail.com",
  "test1@nimbustest.com",
];

export function isAdmin(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}
