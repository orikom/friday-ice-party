"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface JoinEventButtonProps {
  eventId: string;
  shortCode: string;
  userJoin: { id: string; qrCode: string | null } | null | undefined;
}

export function JoinEventButton({
  eventId,
  shortCode,
  userJoin,
}: JoinEventButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${shortCode}/join`, {
        method: "POST",
      });

      if (response.status === 401) {
        router.push("/auth/signin");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to join event");
        return;
      }

      const data = await response.json();
      if (data.join.qrCode) {
        setShowQR(true);
      }
      router.refresh();
    } catch (error) {
      console.error("Failed to join event:", error);
      alert("Failed to join event");
    } finally {
      setLoading(false);
    }
  };

  if (userJoin) {
    return (
      <>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold">✓ You're joined!</p>
            {userJoin.qrCode && (
              <Button
                variant="outline"
                onClick={() => setShowQR(true)}
                className="mt-2"
              >
                View QR Code
              </Button>
            )}
          </div>
        </div>
        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your Event QR Code</DialogTitle>
              <DialogDescription>
                Show this QR code at the event entrance
              </DialogDescription>
            </DialogHeader>
            {userJoin.qrCode && (
              <div className="flex justify-center">
                <Image
                  src={userJoin.qrCode}
                  alt="QR Code"
                  width={300}
                  height={300}
                  className="border rounded"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Button
      onClick={handleJoin}
      disabled={loading}
      className="w-full"
      size="lg"
    >
      {loading ? "Joining..." : "Join Event"}
    </Button>
  );
}
