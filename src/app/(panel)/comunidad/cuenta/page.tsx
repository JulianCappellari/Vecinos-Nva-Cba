import { currentUser } from "@/lib/community/auth";
import { Account } from "@/components/community/Account";
export const metadata = { title: "Mi cuenta", robots: { index: false, follow: false } };
export default async function AccountPage({ searchParams }: { searchParams: { volver?: string } }) {
  const user = await currentUser().catch(() => null);
  return <div className="community-container"><Account user={user} returnTo={searchParams.volver} /></div>;
}
