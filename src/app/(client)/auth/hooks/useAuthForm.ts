import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/config/firebase";

export function useAuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Dynamic schema based on isLogin
  const schema = useMemo(
    () =>
      z.object({
        email: z.email({ message: "Invalid email address" }),
        password: isLogin
          ? z.string()
          : z
              .string()
              .min(6, { message: "Password must be at least 6 characters" }),
      }),
    [isLogin]
  );

  type AuthFormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: AuthFormValues) => {
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      } else {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
        setIsLogin(true);
      }
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
      reset();
    }
  };

  const toggleMode = () => {
    setIsLogin((v) => !v);
    setError("");
    reset();
  };

  return {
    isLogin,
    error,
    loading,
    register,
    handleSubmit,
    errors,
    onSubmit,
    toggleMode,
  };
}
