import { requireAdmin } from "@/lib/auth-helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ManageGroupsForm } from "@/components/ManageGroupsForm";
import { GroupsList } from "@/components/GroupsList";

async function getGroups() {
  return await prisma.group.findMany({
    include: {
      _count: {
        select: {
          members: true,
          targetEvents: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export default async function AdminGroupsPage() {
  await requireAdmin();
  const groups = await getGroups();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Manage Groups</h1>
        <p className="text-gray-600">
          Manage WhatsApp subgroups for event notifications
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create Group</CardTitle>
          <CardDescription>Add a new WhatsApp group</CardDescription>
        </CardHeader>
        <CardContent>
          <ManageGroupsForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Groups</CardTitle>
          <CardDescription>{groups.length} total groups</CardDescription>
        </CardHeader>
        <CardContent>
          <GroupsList groups={groups} />
        </CardContent>
      </Card>
    </div>
  );
}
