import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname");

    if (pathname) {
      redirect(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    } else {
      redirect("/login");
    }
  }

  return <>{children}</>;
}
