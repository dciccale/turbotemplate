import type en from "@turbotemplate/i18n/messages/en.json";

const dashboardLabels: Record<string, keyof typeof en.dashboard> = {
  Dashboard: "Dashboard",
  Billing: "Billing",
  Lifecycle: "Lifecycle",
  Analytics: "Analytics",
  Projects: "Projects",
  Team: "Team",
  Settings: "Settings",
  GetHelp: "GetHelp",
  Search: "Search",
  DataLibrary: "DataLibrary",
  Reports: "Reports",
  WordAssistant: "WordAssistant",
  CoverPage: "CoverPage",
  TableOfContents: "TableOfContents",
  Narrative: "Narrative",
  Financial: "Financial",
  Legal: "Legal",
  PlainLanguage: "PlainLanguage",
  Planning: "Planning",
  Research: "Research",
  TechnicalContent: "TechnicalContent",
  Visual: "Visual",
  Done: "Done",
  InProcess: "InProcess",
  InProgress: "InProgress",
  NotStarted: "NotStarted",
  type: "Type",
  status: "Status",
  target: "Target",
  limit: "Limit",
  reviewer: "Reviewer",
  header: "Header",
};
export function dashboardKey(value: string): keyof typeof en.dashboard {
  return dashboardLabels[value] ?? "Unknown";
}
const statuses: Record<string, keyof typeof en.billing> = {
  active: "active",
  inactive: "inactive",
  trialing: "trialing",
  past_due: "past_due",
  unpaid: "unpaid",
  incomplete: "incomplete",
  incomplete_expired: "incomplete_expired",
  canceled: "subscriptionCanceled",
  paid: "paid",
  open: "open",
  draft: "draft",
  void: "void",
  uncollectible: "uncollectible",
};
export function billingStatusKey(value: string): keyof typeof en.billing {
  return statuses[value] ?? "unknown";
}
export function billingIntervalKey(value: string | undefined) {
  switch (value) {
    case "day":
    case "week":
    case "month":
    case "year":
      return value;
    default:
      return "period";
  }
}
