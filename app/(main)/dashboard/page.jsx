import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import FeedbackModal from "@/components/FeedbackModal"; // ✅ USE MODAL

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();

  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} />

      {/* ✅ Popup Button (opens modal) */}
      <div className="mt-6">
        <FeedbackModal />
      </div>
    </div>
  );
}