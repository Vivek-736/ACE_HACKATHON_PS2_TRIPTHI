"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { SELECTABLE_ROLES, type SelectableRole } from "@/db/schema";

const schema = z
  .object({
    role: z.enum(SELECTABLE_ROLES, { error: "Choose one role." }),
    organisationName: z.string().trim().max(120, "Keep the organisation name under 120 characters."),
    displayName: z.string().trim().max(80, "Keep the display name under 80 characters."),
  })
  .superRefine((value, ctx) => {
    const needsOrganisation = value.role === "donor" || value.role === "receiver";
    if (needsOrganisation && value.organisationName.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["organisationName"],
        message: "Enter your organisation name.",
      });
    }
  });

type FieldName = "role" | "organisationName" | "displayName";
type FieldErrors = Partial<Record<FieldName, string>>;

const ROLE_OPTIONS: { value: SelectableRole; label: string }[] = [
  { value: "donor", label: "Food donor" },
  { value: "receiver", label: "Receiver organisation" },
  { value: "volunteer", label: "Volunteer" },
];

const FIELD_CLASS =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function OnboardingForm() {
  const [role, setRole] = useState<SelectableRole | "">("");
  const [organisationName, setOrganisationName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const showOrganisation = role === "donor" || role === "receiver";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const parsed = schema.safeParse({ role, organisationName, displayName });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !(key in next)) {
          next[key as FieldName] = issue.message;
        }
      }
      setFieldErrors(next);
      setFormError("Please fix the highlighted fields.");
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/onboarding/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: parsed.data.role,
          organisationName: parsed.data.organisationName,
          displayName: parsed.data.displayName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        window.location.assign(data.redirectTo);
        return;
      }

      if (res.status === 409) {
        setFormError("This account already has a role. Refresh to continue.");
      } else {
        setFormError("Could not save your role. Please try again.");
      }
    } catch {
      setFormError("Could not save your role. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 rounded-lg border border-border bg-card p-6">
      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-medium text-foreground">Your role</legend>
        {ROLE_OPTIONS.map((option) => {
          const id = `role-${option.value}`;
          return (
            <div key={option.value} className="flex items-center gap-3">
              <input
                id={id}
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={() => setRole(option.value)}
                aria-invalid={fieldErrors.role ? true : undefined}
                aria-describedby={fieldErrors.role ? "role-error" : undefined}
                className="h-4 w-4 accent-primary focus-visible:ring-2 focus-visible:ring-ring"
              />
              <label htmlFor={id} className="text-sm text-foreground">
                {option.label}
              </label>
            </div>
          );
        })}
        {fieldErrors.role ? (
          <p id="role-error" className="text-sm text-destructive">
            {fieldErrors.role}
          </p>
        ) : null}
      </fieldset>

      {showOrganisation ? (
        <div className="space-y-2">
          <label htmlFor="organisationName" className="block text-sm font-medium text-foreground">
            Organisation name
          </label>
          <input
            id="organisationName"
            name="organisationName"
            type="text"
            maxLength={120}
            value={organisationName}
            onChange={(e) => setOrganisationName(e.target.value)}
            aria-invalid={fieldErrors.organisationName ? true : undefined}
            aria-describedby={fieldErrors.organisationName ? "organisationName-error" : undefined}
            className={FIELD_CLASS}
          />
          {fieldErrors.organisationName ? (
            <p id="organisationName-error" className="text-sm text-destructive">
              {fieldErrors.organisationName}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="displayName" className="block text-sm font-medium text-foreground">
          Display name or anonymised alias
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          maxLength={80}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          aria-invalid={fieldErrors.displayName ? true : undefined}
          aria-describedby={fieldErrors.displayName ? "displayName-error" : undefined}
          className={FIELD_CLASS}
        />
        {fieldErrors.displayName ? (
          <p id="displayName-error" className="text-sm text-destructive">
            {fieldErrors.displayName}
          </p>
        ) : null}
      </div>

      {formError ? (
        <div role="alert" className="rounded-md border border-destructive bg-background p-3 text-sm text-destructive">
          {formError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
