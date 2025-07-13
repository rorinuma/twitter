"use client";

import { FaXTwitter } from "react-icons/fa6";
import { useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import api from "@/lib/axios";
import { useSafeBack } from "@/hooks/goSafeBack";
import { useClickOutside } from "@/hooks/clickOutside";
import { FormData } from "@/types/auth.types";
import { UserSchema } from "@/schemas/userSchema";
import BlueOverlay from "@/components/shared/overlays/BlueOverlay";
import CloseElement from "@/components/ui/buttons/CloseElement";
import AuthInput from "@/components/auth/AuthInput";
import ErrorOverlay from "@/components/shared/overlays/ErrorOverlay";

type Errors = Partial<Record<keyof FormData, string>> & {
  general?: string;
};

export default function SignUpModal() {
  const formRef = useRef<HTMLFormElement>(null);
  const safeBack = useSafeBack("/");
  const pathname = usePathname();
  const router = useRouter();

  const isOpen = useMemo(() => {
    return pathname === "/signup";
  }, [pathname]);

  useClickOutside([formRef], () => {
    safeBack();
  });

  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const validateField = (name: keyof FormData, value: string) => {
    const tempFormData = { ...formData, [name]: value };
    const result = UserSchema.safeParse(tempFormData);
    if (result.success) return undefined;

    const fieldError = result.error.issues.find(
      (issue) => issue.path[0] === name,
    );
    return fieldError ? fieldError.message : undefined;
  };

  const validateFullForm = () => {
    const result = UserSchema.safeParse(formData);
    setIsFormValid(result.success);
    return result;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    validateFullForm();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    validateFullForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = validateFullForm();

    if (!result.success) {
      const newErrors: Errors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormData;
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return;
    }
    try {
      await api.post(`/signup`, formData);
      setErrors((prev) => ({
        ...prev,
        general: "Sign up successful",
      }));

      setTimeout(() => {
        setErrors((prev) => ({ ...prev, general: undefined }));
      }, 3000);
      router.push("/signin");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const general = err.response?.data;
        setErrors((prev) => ({ ...prev, general }));
        setTimeout(() => {
          setErrors((prev) => ({ ...prev, general: undefined }));
        }, 3000);

        console.error(
          "error in signup handleSubmit",
          err.response?.data || err.message,
        );
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "An unexpected error occurred",
        }));
        setTimeout(() => {
          setErrors((prev) => ({ ...prev, general: undefined }));
        }, 3000);
        console.error("unknown error in signup handleSubmit", err);
      }
    }
  };

  return (
    isOpen && (
      <>
        <BlueOverlay>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center min-w-4/5 p-1 h-full relative bg-black rounded-2xl z-30 md:min-w-[600px] md:max-w-[80vw] max-h-[650px]"
            ref={formRef}
          >
            <CloseElement
              backHref={"/"}
              centeredNode={<FaXTwitter className="size-7" />}
            />
            <div className="flex flex-col overflow-y-scroll no-scrollbar p-5 xs:px-20 w-full mt-6">
              <h1 className="text-3xl font-bold">Create your account</h1>
              <div className="flex flex-col mt-4 gap-1">
                <AuthInput
                  label="Username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.username}
                  maxLength={50}
                  required
                />
                <AuthInput
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  required
                />
                <AuthInput
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.password}
                  required
                />
                <AuthInput
                  label="Confirm password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.confirmPassword}
                  required
                />
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="py-4 rounded-full bg-foreground text-foreground-alt hover:bg-button-hover duration-(--hover-duration) disabled:opacity-80"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </form>
        </BlueOverlay>
        {errors.general && <ErrorOverlay error={errors.general} />}
      </>
    )
  );
}
