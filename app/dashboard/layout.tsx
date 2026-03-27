import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "./_components/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const restaurant = await prisma.restaurant.findFirst({
    where: { userId: session.user.id },
  });

  return (
    <DashboardShell
      restaurantId={restaurant?.id ?? ""}
      restaurantName={restaurant?.name ?? "My Restaurant"}
      brandingColor={restaurant?.brandingColor ?? "#6366f1"}
      userName={session.user.name ?? ""}
      userEmail={session.user.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
