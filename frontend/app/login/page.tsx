"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@mts-ds/granat2-react-button";
import { InputField, InputPasswordField } from "@mts-ds/granat2-react-fields";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    setLoading(false);

    if (result?.error) {
      setError("Неверный email или пароль");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-background-lower)",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--color-background-primary)",
          borderRadius: "var(--radius-l)",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "var(--shadow-middle)",
        }}
      >
        <h1
          style={{
            fontFamily: "MTS Wide",
            fontWeight: 700,
            fontSize: "24px",
            marginBottom: "8px",
            color: "var(--color-text-primary)",
          }}
        >
          Legal Hub
        </h1>
        <p
          style={{
            fontFamily: "MTS Compact",
            fontSize: "14px",
            color: "var(--color-text-secondary)",
            marginBottom: "32px",
          }}
        >
          Портал БПО МГТС
        </p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <InputField
            label="Email"
            placeholder="admin@test.ru"
            {...register("email")}
            state={errors.email ? "invalid" : undefined}
            error={errors.email?.message}
          />
          <InputPasswordField
            label="Пароль"
            placeholder="••••••"
            {...register("password")}
            error={errors.password?.message}
          />

          {error && (
            <p style={{ color: "var(--color-accent-negative)", fontSize: "14px", fontFamily: "MTS Compact" }}>
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} style={{ marginTop: "8px" }}>
            {loading ? "Вход..." : "Войти"}
          </Button>
        </form>
      </div>
    </div>
  );
}
