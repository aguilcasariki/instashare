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
import { toast } from "sonner";

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

  const firebaseErrorMessages: Record<string, string> = {
    "auth/user-not-found": "No user found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "Email is already in use.",
    "auth/invalid-email": "Invalid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
  };

  const onSubmit = async (data: AuthFormValues) => {
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast.success("Logged in successfully!");
      } else {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
        setIsLogin(true);
        toast.success("Account created successfully! Please log in.");
      }
      router.push("/");
    } catch (err: unknown) {
      let message = "An unknown error occurred.";
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as { code?: unknown }).code === "string"
      ) {
        const code = (err as { code: string }).code;
        message =
          firebaseErrorMessages[code] ||
          (typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as { message?: unknown }).message === "string"
            ? (err as { message: string }).message
            : message);
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      toast.error(message);
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
