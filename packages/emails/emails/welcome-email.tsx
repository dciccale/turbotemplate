import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type WelcomeEmailProps = {
  name?: string;
  appUrl: string;
};

export function WelcomeEmail({ name, appUrl }: WelcomeEmailProps) {
  const firstName = name?.trim() || "builder";

  return (
    <Html>
      <Head />
      <Preview>Your Turbotemplate workspace is ready</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={eyebrow}>Turbotemplate</Text>
          <Heading style={heading}>Welcome, {firstName}</Heading>
          <Text style={text}>
            Your account is live and ready to go. Turbotemplate gives you a
            production-ready starting point so you can move from idea to shipped
            product faster.
          </Text>
          <Text style={text}>
            Open your workspace to continue setup and start building.
          </Text>
          <Section style={buttonSection}>
            <Button href={appUrl} style={button}>
              Open Workspace
            </Button>
          </Section>
          <Hr style={divider} />
          <Text style={smallText}>
            If the button does not work, paste this URL in your browser:
            <br />
            {appUrl}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;

const body = {
  background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
  margin: "0",
  padding: "24px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "32px",
};

const eyebrow = {
  color: "#0f172a",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
};

const heading = {
  color: "#0f172a",
  fontSize: "28px",
  fontWeight: "700",
  letterSpacing: "-0.02em",
  lineHeight: "34px",
  margin: "0 0 14px",
};

const text = {
  color: "#334155",
  fontSize: "16px",
  lineHeight: "25px",
  margin: "0 0 14px",
};

const buttonSection = {
  marginBottom: "24px",
  marginTop: "6px",
};

const button = {
  backgroundColor: "#0f172a",
  borderRadius: "9px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 18px",
  textDecoration: "none",
};

const divider = {
  borderColor: "#e2e8f0",
  margin: "20px 0",
};

const smallText = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
};
