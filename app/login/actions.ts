"use server";

import { signIn } from "@/auth";

type LoginState = {
  error?: string;
};

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    // İşte altın vuruş burası! formData'yı ham atmıyoruz, içinden bilgileri ayıklayıp
    // NextAuth'a "Giriş başarılı olursa doğrudan /dashboard adresine git" diye açıkça emrediyoruz.
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    
    return {};
  } catch (error: any) {
    if (
      error?.type === "CredentialsSignin" ||
      error?.message?.includes("CredentialsSignin")
    ) {
      return {
        error: "E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin."
      };
    }

    // Yönlendirme sinyalini fırlatıyoruz
    throw error;
  }
}