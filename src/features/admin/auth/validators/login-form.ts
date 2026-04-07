import { z } from "zod";

const loginSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(200),
});

export interface LoginFormValues {
  email: string;
}

export interface LoginValidationResult {
  formError?: string;
  isValid: boolean;
  values: LoginFormValues;
}

export function validateLoginForm(formData: FormData): LoginValidationResult {
  const rawEmail = String(formData.get("email") ?? "").trim();
  const rawPassword = String(formData.get("password") ?? "");

  const parsed = loginSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!parsed.success) {
    return {
      formError: "Enter a valid email address and password.",
      isValid: false,
      values: {
        email: rawEmail,
      },
    };
  }

  return {
    isValid: true,
    values: {
      email: parsed.data.email,
    },
  };
}
