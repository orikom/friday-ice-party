"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Verify token on mount
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`/api/auth/invite/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid or expired invitation link");
        setLoading(false);
        return;
      }

      setUserEmail(data.email);
      setUserName(data.name);
      setLoading(false);
    } catch (error) {
      console.error("Token verification error:", error);
      setError("Failed to verify invitation link");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("הסיסמאות לא תואמות / Passwords do not match");
      setSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError(
        "הסיסמה חייבת להכיל לפחות 6 תווים / Password must be at least 6 characters"
      );
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/auth/invite/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to set password");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (error) {
      console.error("Set password error:", error);
      setError(
        "אירעה שגיאה. אנא נסה שוב / An error occurred. Please try again."
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !userEmail) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2 text-red-600">
                <AlertCircle className="h-6 w-6" />
                שגיאה / Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{error}</p>
              <Button
                onClick={() => router.push("/auth/signin")}
                className="mt-4 w-full"
              >
                חזור להתחברות / Back to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                סיסמה הוגדרה בהצלחה! / Password Set Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                הסיסמה שלך הוגדרה בהצלחה. אתה מועבר לדף ההתחברות...
              </p>
              <p className="text-sm text-gray-500">
                Your password has been set successfully. Redirecting to sign
                in...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              הגדר סיסמה / Set Password
            </CardTitle>
            <CardDescription>
              {userName
                ? `שלום ${userName}, אנא הגדר את הסיסמה שלך`
                : `Hello, please set your password`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userEmail && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>אימייל / Email:</strong> {userEmail}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">סיסמה / Password *</Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="לפחות 6 תווים / At least 6 characters"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">
                    אשר סיסמה / Confirm Password *
                  </Label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="הזן שוב את הסיסמה / Re-enter password"
                    disabled={submitting}
                  />
                </div>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting || !password || !confirmPassword}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      מגדיר סיסמה... / Setting password...
                    </>
                  ) : (
                    "הגדר סיסמה / Set Password"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
