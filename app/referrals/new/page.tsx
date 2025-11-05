import { requireAuth } from "@/lib/auth-helpers";
import { ReferralForm } from "@/components/ReferralForm";

export default async function ReferralPage() {
  await requireAuth(); // Only authenticated members can refer

  return (
    <div className="min-h-screen bg-gray-50">
      <ReferralForm />
    </div>
  );
}
