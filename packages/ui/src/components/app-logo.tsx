import { AppIcon } from "./app-icon";

export function AppLogo({ name }: { name: string }) {
  return (
    <div className="flex gap-2">
      <AppIcon />
      <span className="font-bold">{name}</span>
    </div>
  );
}
