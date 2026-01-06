"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UnlockPage() {
  const params = useSearchParams();
  const router = useRouter();
  const songId = Number(params.get("song"));

  const [user, setUser] = useState<any>(null);
  const [song, setSong] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "locked" | "unlocked">(
    "loading"
  );

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      const { data: song } = await supabase
        .from("songs")
        .select("*")
        .eq("id", songId)
        .single();

      setSong(song);

      if (!user) {
        setStatus("locked");
        return;
      }

      const { data: existing } = await supabase
        .from("user_songs")
        .select("id")
        .eq("user_id", user.id)
        .eq("song_id", songId)
        .single();

      if (!existing) {
        await supabase.from("user_songs").insert({
          user_id: user.id,
          song_id: songId,
        });

        // 🔎 contar canciones desbloqueadas
        const { data: all } = await supabase
          .from("user_songs")
          .select("song_id")
          .eq("user_id", user.id);

        if (all && all.length === 9) {
          // 🏁 registrar final del álbum (solo una vez)
          const { data: completed } = await supabase
            .from("album_completions")
            .select("user_id")
            .eq("user_id", user.id)
            .single();

          if (!completed) {
            await supabase.from("album_completions").insert({
              user_id: user.id,
            });
          }
        }
      }

      setStatus("unlocked");
    };

    init();
  }, [songId]);

  if (status === "loading") {
    return <p style={{ padding: 20 }}>Cargando…</p>;
  }

  if (status === "locked") {
    return (
      <main style={{ padding: 20 }}>
        <h1>{song?.title}</h1>
        <p>Para seguir escuchando el álbum necesitás crear un usuario.</p>
        <button onClick={() => router.push("/")}>Ir al álbum</button>
      </main>
    );
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>{song?.title}</h1>

      {song?.audio_url && (
        <audio
          src={song.audio_url}
          controls
          autoPlay
          style={{ width: "100%", marginBottom: 16 }}
        />
      )}

      <button onClick={() => router.push("/")}>Ir al álbum</button>
    </main>
  );
}

