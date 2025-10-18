import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Welcome back to turbotemplate
          </h1>
          <p className="text-muted-foreground">
            Sign in to your turbotemplate account
          </p>
        </div>
        <div>
          <SignIn
            path="/app/sign-in"
            routing="path"
            fallbackRedirectUrl="/app"
            signUpFallbackRedirectUrl="/app"
            appearance={{
              elements: {
                rootBox: "mx-auto",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
