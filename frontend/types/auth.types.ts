import { FieldError, UseFormRegister } from "react-hook-form";

export type FormData = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export type FormFieldProps = {
  type: string;
  placeholder?: string;
  name: ValidFieldNames;
  maxLength?: number;
  register: UseFormRegister<FormData>;
  error: FieldError | undefined;
  value: string;
};

export type ValidFieldNames =
  | "email"
  | "username"
  | "password"
  | "confirmPassword";
