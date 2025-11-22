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
        <h1 className="text-4xl font-bold mb-2">לוח בקרה</h1>
        <p className="text-gray-600">נהל אירועים, חברים וקבוצות</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              אירועים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.eventCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              חברים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.memberCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              קבוצות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.groupCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              הצטרפויות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.joinCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>אירועים</CardTitle>
            <CardDescription>צור ונהל אירועים</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/events/new">
              <Button className="w-full">צור אירוע</Button>
            </Link>
            <Link href="/admin/events">
              <Button className="w-full" variant="outline">
                נהל אירועים
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>חברים</CardTitle>
            <CardDescription>הזמן ונהל חברים</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/members">
              <Button className="w-full" variant="outline">
                נהל חברים
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>קבוצות</CardTitle>
            <CardDescription>נהל קבוצות וואטסאפ</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/groups">
              <Button className="w-full" variant="outline">
                נהל קבוצות
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>הפניות</CardTitle>
            <CardDescription>סקור הפניות חברים</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/referrals">
              <Button className="w-full" variant="outline">
                נהל הפניות
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
