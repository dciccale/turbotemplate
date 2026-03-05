import { pretty, render } from "@react-email/render";
import { WelcomeEmail, type WelcomeEmailProps } from "./emails/welcome-email";

export async function renderWelcomeEmail(
  props: WelcomeEmailProps,
): Promise<string> {
  return pretty(await render(<WelcomeEmail {...props} />));
}
