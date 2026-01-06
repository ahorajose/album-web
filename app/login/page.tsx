"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Crear usuario
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError && signUpError.message !== "User already registered") {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. Loguear SIEMPRE (clave del sistema)
    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // 3. Volver al álbum
    window.location.href = "/";
  }

  return (
    <main style={{ padding: 20, maxWidth: 400 }}>
      <h1 style={{ marginBottom: 16 }}>Crear usuario</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 12 }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 12 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading ? "Entrando…" : "Crear usuario"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: 12 }}>{error}</p>
      )}
    </main>
  );
}
