import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { industries } from "@/data/industries";
import OnboardingForm from "../onboarding/_components/onboarding-form";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 👇 No onboarding status check, we ALWAYS allow editing here
  return (
    <main>
      <OnboardingForm industries={industries} />
    </main>
  );
}
