import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";
import ProfileView from "@/components/ProfileView";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("team_task_token")?.value;
  let user = null;

  if (token) {
    user = await verifyToken(token);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 to-blue-100 p-4">
      {user ? <ProfileView user={user} /> : <LoginForm />}
    </div>
  );
}
