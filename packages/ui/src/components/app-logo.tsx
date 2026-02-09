import { AppIcon } from "./app-icon";

export function AppLogo() {
  return (
    <div className="flex gap-2">
      <AppIcon />
      <span className="font-bold">turbotemplate</span>
    </div>
  );
}
