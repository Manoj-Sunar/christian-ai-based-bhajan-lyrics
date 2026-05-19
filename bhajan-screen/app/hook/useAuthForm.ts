"use client";

import { useForm } from "react-hook-form";

export interface AuthFormValues {
  name?: string;
  email: string;
  password: string;
}

export function useAuthForm(mode: "login" | "register") {
  return useForm<AuthFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });
}