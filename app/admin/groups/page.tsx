import { requireAdmin } from "@/lib/auth-helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/prisma";
import { ManageGroupsForm } from "@/components/ManageGroupsForm";

async function getGroups() {
  return await prisma.group.findMany({
    include: {
      _count: {
        select: {
          members: true,
          events: true,
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
          <div className="space-y-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="font-semibold">{group.name}</div>
                  <div className="text-sm text-gray-600">
                    {group._count.members} members • {group._count.events}{" "}
                    events
                  </div>
                  {group.waId && (
                    <div className="text-xs text-gray-500">
                      WA ID: {group.waId}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
