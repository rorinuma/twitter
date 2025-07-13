import { z } from "zod";

export const UserSchema = z
  .object({
    email: z.string().email(),
    username: z
      .string()
      .min(6, { message: "Username must be at least 6 characters" })
      .max(50, { message: "Username must be less than 6 characters" }),
    password: z
      .string()
      .min(8, { message: "Password is too short" })
      .max(20, { message: "Password is too long" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpSchemaType = z.infer<typeof UserSchema>;

export const SignInSchema = z.object({
  emailOrUsername: z
    .string()
    .min(6, { message: "Username is at least 6 characters long" }),
  password: z
    .string()
    .min(8, { message: "Password is too short" })
    .max(20, { message: "Password is too long" }),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;
