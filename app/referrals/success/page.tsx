import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function ReferralSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Referral Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Thank you for referring someone to our community! Your referral has
            been submitted and is now pending admin review.
          </p>
          <p className="text-sm text-gray-500">
            We'll notify you once the referral has been reviewed. In the
            meantime, you can submit another referral or return to the
            dashboard.
          </p>
          <div className="flex gap-4 pt-4">
            <Link href="/referrals/new">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Refer Another Person
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Return Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
