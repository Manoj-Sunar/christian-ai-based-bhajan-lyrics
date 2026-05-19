"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/app/lib/utils";



import { useAuthForm } from "@/app/hook/useAuthForm";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { publicApi } from "@/app/API/public.api";
import { InputField } from "@/app/components/UI/InputField";

export default function RegisterPage() {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: publicApi.register,
        onSuccess: (data: any) => {
            console.log(data);
        },

        onError: (error) => {
            console.log(error);
        }
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useAuthForm("register");

    const onSubmit = async (data: any) => {

        await mutateAsync(data);


    };

    return (

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <InputField
                label="Full Name"
                placeholder="John Doe"
                {...register("name", { required: "Name is required" })}
                error={errors.name?.message}
            />

            <InputField
                label="Email"
                type="email"
                placeholder="you@example.com"
                {...register("email", { required: "Email is required" })}
                error={errors.email?.message}
            />

            <InputField
                label="Password"
                type="password"
                placeholder="••••••••"
                {...register("password", {
                    required: "Password is required",
                    minLength: {
                        value: 6,
                        message: "Minimum 6 characters required",
                    },
                })}
                error={errors.password?.message}
            />

            <button
                disabled={isPending}
                className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                )}
            >
                {isPending ? "Creating..." : "Create Account"}
                {!isPending && <ArrowRight size={18} />}
            </button>

            <p className="mt-10 text-center text-slate-500 font-medium">


                Already have an account?

                <Link href={"/auth/login"} className="ml-2 text-indigo-600 font-bold hover:underline">Login</Link>
            </p>

        </form>

    );
}