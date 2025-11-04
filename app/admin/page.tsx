import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getStats() {
  const [eventCount, memberCount, groupCount, joinCount] = await Promise.all([
    prisma.event.count(),
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.group.count(),
    prisma.eventJoin.count(),
  ]);

  return { eventCount, memberCount, groupCount, joinCount };
}

export default async function AdminDashboard() {
  await requireAdmin();
  const stats = await getStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage events, members, and groups</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.eventCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.memberCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.groupCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Joins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.joinCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>Create and manage events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/events/new">
              <Button className="w-full">Create Event</Button>
            </Link>
            <Link href="/admin/events">
              <Button className="w-full" variant="outline">
                Manage Events
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Invite and manage members</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/members">
              <Button className="w-full" variant="outline">
                Manage Members
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Groups</CardTitle>
            <CardDescription>Manage WhatsApp groups</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/groups">
              <Button className="w-full" variant="outline">
                Manage Groups
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
