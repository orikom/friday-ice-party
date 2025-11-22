import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function ReferralSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">ההפניה נשלחה!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            תודה שהפנית מישהו לקהילה שלנו! ההפניה שלך נשלחה ונמצאת כעת בבדיקת מנהל.
          </p>
          <p className="text-sm text-gray-500">
            נודיע לך ברגע שההפניה תיבדק. בינתיים, אתה יכול לשלוח הפניה נוספת או לחזור לדף הבית.
          </p>
          <div className="flex gap-4 pt-4">
            <Link href="/referrals/new">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                הפנה אדם נוסף
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">חזור לדף הבית</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
