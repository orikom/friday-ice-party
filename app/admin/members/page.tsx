import { requireAdmin } from "@/lib/auth-helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { InviteMemberForm } from "@/components/InviteMemberForm";
import { MembersList } from "@/components/MembersList";

async function getMembers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      city: true,
      occupation: true,
      description: true,
      instagramUrl: true,
      linkedinUrl: true,
      createdAt: true,
    },
  });
}

export default async function AdminMembersPage() {
  await requireAdmin();
  const members = await getMembers();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Manage Members</h1>
        <p className="text-gray-600">Invite and manage community members</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Invite Member</CardTitle>
          <CardDescription>Send an invitation to a new member</CardDescription>
        </CardHeader>
        <CardContent>
          <InviteMemberForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
          <CardDescription>{members.length} total members</CardDescription>
        </CardHeader>
        <CardContent>
          <MembersList members={members} />
        </CardContent>
      </Card>
    </div>
  );
}
