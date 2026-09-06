"use client";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";
// Clerk rebuilds its form when localization changes. Keep the identifier in this
// stable parent and supply the supported initialValues prop to the new form.
export function AuthPanel({ mode }: { mode: "sign-in" | "sign-up" }) {
  const [emailAddress, setEmailAddress] = useState("");
  return (
    <div
      onInputCapture={(event) => {
        const input = event.target;
        if (
          input instanceof HTMLInputElement &&
          (input.name === "identifier" ||
            input.name === "emailAddress" ||
            input.type === "email")
        )
          setEmailAddress(input.value);
      }}
    >
      {mode === "sign-in" ? (
        <SignIn
          path="/app/sign-in"
          routing="path"
          fallbackRedirectUrl="/app"
          signUpFallbackRedirectUrl="/app"
          initialValues={{ emailAddress }}
          appearance={{ elements: { rootBox: "mx-auto" } }}
        />
      ) : (
        <SignUp
          path="/app/sign-up"
          routing="path"
          fallbackRedirectUrl="/app"
          signInFallbackRedirectUrl="/app"
          initialValues={{ emailAddress }}
          appearance={{ elements: { rootBox: "mx-auto" } }}
        />
      )}
    </div>
  );
}
