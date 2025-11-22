import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReferralsList } from "@/components/ReferralsList";

async function getReferrals() {
  const referrals = await prisma.referral.findMany({
    include: {
      referrer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviewedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Convert Date objects to ISO strings for client component
  return referrals.map((referral) => ({
    ...referral,
    createdAt: referral.createdAt.toISOString(),
    reviewedAt: referral.reviewedAt?.toISOString() || null,
  }));
}

export default async function AdminReferralsPage() {
  await requireAdmin();
  const referrals = await getReferrals();

  const pendingCount = referrals.filter((r) => r.status === "PENDING").length;
  const approvedCount = referrals.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = referrals.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">הפניות חברים</h1>
        <p className="text-gray-600">סקור ונהל הפניות חברים מהקהילה</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ממתינים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">אושרו</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {approvedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">נדחו</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {rejectedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>כל ההפניות</CardTitle>
          <CardDescription>
            לחץ על הפניה כדי לצפות בפרטים ולאשר או לדחות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReferralsList referrals={referrals} />
        </CardContent>
      </Card>
    </div>
  );
}
