import { AppShell } from "@/components/app-shell";
import { DashboardBillingSection } from "@/components/dashboard-billing-section";

export default function BillingPage() {
  return (
    <AppShell title="Billing" subtitle="Stripe invoices and products">
      <DashboardBillingSection />
    </AppShell>
  );
}
