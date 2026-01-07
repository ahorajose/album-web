"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UnlockClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const songId = searchParams.get("song");

  const [song, setSong] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!songId) return;

    async function loadSong() {
      const { data } = await supabase
        .from("songs")
        .select("*")
        .eq("id", songId)
        .single();

      setSong(data);
      setLoading(false);
    }

    loadSong();
  }, [songId]);

  if (loading) {
    return <div style={{ padding: 20 }}>Cargando…</div>;
  }

  if (!song) {
    return <div style={{ padding: 20 }}>Canción no encontrada</div>;
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>{song.title}</h1>

      {song.audio_url && (
        <audio controls autoPlay style={{ width: "100%", marginTop: 20 }}>
          <source src={song.audio_url} />
        </audio>
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={() => router.push("/")}>
          Ir al álbum
        </button>
      </div>
    </main>
  );
}
