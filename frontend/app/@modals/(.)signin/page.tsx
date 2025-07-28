"use client";

import { usePathname } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { FaXTwitter } from "react-icons/fa6";
import api from "@/lib/axios";
import axios from "axios";
import { SignInSchema, SignInSchemaType } from "@/schemas/userSchema";
import { useSafeBack } from "@/hooks/goSafeBack";
import { useClickOutside } from "@/hooks/clickOutside";
import BlueOverlay from "@/components/shared/overlays/BlueOverlay";
import CloseElement from "@/components/ui/buttons/CloseElement";
import GoogleButton from "@/components/ui/buttons/GoogleButton";
import Input from "@/components/shared/input/Input";
import ErrorOverlay from "@/components/shared/overlays/ErrorOverlay";
import { createPortal } from "react-dom";

type Errors = Partial<Record<keyof SignInSchemaType, string>> & {
  general?: string;
};

export default function SignIn() {
  const formRef = useRef<HTMLFormElement>(null);
  const safeBack = useSafeBack();
  const [formData, setFormData] = useState<SignInSchemaType>({
    emailOrUsername: "",
    password: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const pathname = usePathname();

  const isOpen = useMemo(() => {
    return pathname === "/signin";
  }, [pathname]);

  useClickOutside([formRef], safeBack);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = SignInSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Errors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SignInSchemaType;
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return;
    }
    try {
      const { data } = await api.post(`/signin`, formData);
      setErrors((prev) => ({ ...prev, general: "Login successful" }));
      if (data) {
        window.location.reload();
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const general = err.response?.data;
        setErrors((prev) => ({ ...prev, general }));
        setTimeout(() => {
          setErrors((prev) => ({ ...prev, general: undefined }));
        }, 3000);

        console.error(
          "error in signin handleSubmit",
          err.response?.data || err.message,
        );
        return;
      }
      setErrors((prev) => ({
        ...prev,
        general: "An unexpected error occurred",
      }));
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, general: undefined }));
      }, 3000);
      console.error("unknown error in sigin handleSubmit", err);
    }
  };

  return (
    isOpen && (
      <>
        <BlueOverlay>
          <form
            ref={formRef}
            className="flex flex-col items-center min-w-4/5 p-1 h-full relative bg-black rounded-2xl z-30 md:min-w-[600px] md:max-w-[80vw] max-h-[650px]"
            onSubmit={handleSubmit}
          >
            <CloseElement
              backHref={"/"}
              centeredNode={<FaXTwitter className="size-7" />}
            />
            <div className="flex flex-col overflow-y-scroll no-scrollbar gap-3 p-5 xs:px-20 w-full">
              <h1 className="text-3xl font-bold">Sign in to X</h1>
              <div className="flex w-full max-w-[300px]">
                <GoogleButton />
              </div>
              <div className="flex flex-col">
                <Input
                  name="emailOrUsername"
                  label="Email or username"
                  type="text"
                  value={formData.emailOrUsername}
                  error={errors.emailOrUsername}
                  onChange={handleChange}
                />
                <Input
                  name="password"
                  type="password"
                  label="Password"
                  value={formData.password}
                  error={errors.password}
                  onChange={handleChange}
                />
                <button
                  type="submit"
                  className="py-4 rounded-full bg-foreground text-foreground-alt hover:bg-button-hover duration-(--hover-duration)"
                >
                  Sign In
                </button>
              </div>
            </div>
          </form>
        </BlueOverlay>
        {errors.general &&
          createPortal(<ErrorOverlay error={errors.general} />, document.body)}
      </>
    )
  );
}
