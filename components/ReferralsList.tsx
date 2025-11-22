"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Link as LinkIcon,
  Calendar,
} from "lucide-react";

interface Referral {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  age: number | null;
  howDoYouKnow: string | null;
  howLong: string | null;
  occupation: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  city: string | null;
  hobbies: string | null;
  interests: string | null;
  notes: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  referrer: {
    id: string;
    name: string | null;
    email: string;
  };
  reviewedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface ReferralsListProps {
  referrals: Referral[];
}

export function ReferralsList({ referrals }: ReferralsListProps) {
  const router = useRouter();
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null
  );
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "reject">("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleApprove = (referral: Referral) => {
    setSelectedReferral(referral);
    setAction("approve");
    setActionDialogOpen(true);
  };

  const handleReject = (referral: Referral) => {
    setSelectedReferral(referral);
    setAction("reject");
    setRejectionReason("");
    setActionDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedReferral) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/referrals/${selectedReferral.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          rejectionReason: action === "reject" ? rejectionReason : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "נכשל בעיבוד ההפניה");
      }

      setActionDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Process referral error:", error);
      alert(
        error instanceof Error ? error.message : "נכשל בעיבוד ההפניה"
      );
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            ממתין
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            אושר
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            נדחה
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (referrals.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>אין הפניות עדיין</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {referrals.map((referral) => (
          <Card
            key={referral.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedReferral(referral);
              setActionDialogOpen(true);
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {referral.name || "לא ידוע"}
                    </h3>
                    {getStatusBadge(referral.status)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {referral.email}
                    </div>
                    {referral.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {referral.phone}
                      </div>
                    )}
                    {referral.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {referral.city}
                      </div>
                    )}
                    {referral.occupation && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {referral.occupation}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    הופנה על ידי{" "}
                    {referral.referrer.name || referral.referrer.email} •{" "}
                    {formatDate(referral.createdAt)}
                  </div>
                </div>
                {referral.status === "PENDING" && (
                  <div
                    className="flex gap-2 ml-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(referral)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      דחה
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(referral)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      אשר
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReferral && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {action === "approve"
                    ? "אשר הפניה"
                    : "דחה הפניה"}
                </DialogTitle>
                <DialogDescription>
                  {action === "approve"
                    ? "זה ייצור חשבון חבר חדש. סקור את הפרטים למטה."
                    : "אנא ספק סיבה לדחייה (אופציונלי)."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Basic Info */}
                <div>
                  <h4 className="font-semibold mb-2">מידע בסיסי</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">שם:</span>{" "}
                      {selectedReferral.name || "לא סופק"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">אימייל:</span>{" "}
                      {selectedReferral.email}
                    </div>
                    {selectedReferral.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">טלפון:</span>{" "}
                        {selectedReferral.phone}
                      </div>
                    )}
                    {selectedReferral.age && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">גיל:</span>{" "}
                        {selectedReferral.age}
                      </div>
                    )}
                    {selectedReferral.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">עיר:</span>{" "}
                        {selectedReferral.city}
                      </div>
                    )}
                  </div>
                </div>

                {/* Relationship */}
                <div>
                  <h4 className="font-semibold mb-2">קשר</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">איך הם מכירים:</span>{" "}
                      {selectedReferral.howDoYouKnow || "לא סופק"}
                    </div>
                    <div>
                      <span className="font-medium">כמה זמן:</span>{" "}
                      {selectedReferral.howLong || "לא סופק"}
                    </div>
                  </div>
                </div>

                {/* Professional */}
                {(selectedReferral.occupation ||
                  selectedReferral.linkedinUrl ||
                  selectedReferral.instagramUrl) && (
                  <div>
                    <h4 className="font-semibold mb-2">מקצועי</h4>
                    <div className="space-y-2 text-sm">
                      {selectedReferral.occupation && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          {selectedReferral.occupation}
                        </div>
                      )}
                      {selectedReferral.linkedinUrl && (
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4 text-gray-400" />
                          <a
                            href={selectedReferral.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            פרופיל LinkedIn
                          </a>
                        </div>
                      )}
                      {selectedReferral.instagramUrl && (
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4 text-gray-400" />
                          <a
                            href={selectedReferral.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            פרופיל Instagram
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Personal */}
                {(selectedReferral.hobbies || selectedReferral.interests) && (
                  <div>
                    <h4 className="font-semibold mb-2">אישי</h4>
                    <div className="space-y-2 text-sm">
                      {selectedReferral.hobbies && (
                        <div>
                          <span className="font-medium">תחביבים:</span>{" "}
                          {selectedReferral.hobbies}
                        </div>
                      )}
                      {selectedReferral.interests && (
                        <div>
                          <span className="font-medium">תחומי עניין:</span>{" "}
                          {selectedReferral.interests}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedReferral.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Additional Notes</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedReferral.notes}
                    </p>
                  </div>
                )}

                {/* Rejection Reason */}
                {action === "reject" && (
                  <div>
                    <Label htmlFor="rejectionReason">
                      סיבת דחייה (אופציונלי)
                    </Label>
                    <Textarea
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      placeholder="למה ההפניה נדחית?"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setActionDialogOpen(false)}
                  disabled={processing}
                >
                  ביטול
                </Button>
                <Button
                  variant={action === "reject" ? "destructive" : "default"}
                  onClick={handleSubmitAction}
                  disabled={processing}
                >
                  {processing
                    ? "מעבד..."
                    : action === "approve"
                    ? "אשר ויצור חשבון"
                    : "דחה הפניה"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
