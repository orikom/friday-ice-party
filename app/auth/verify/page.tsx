import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              בדוק את האימייל שלך
            </CardTitle>
            <CardDescription>
              שלחנו לך קישור קסם להתחברות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              לחץ על הקישור באימייל כדי להתחבר. הקישור יפוג תוך 24 שעות.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
