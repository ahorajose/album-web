"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Song = {
  id: number;
  title: string;
  cover_path: string | null;
  audio_url: string | null;
  mosaic_position: number;
  launch_start: string;
};

export default function AlbumPage() {
  const [user, setUser] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [overlaySong, setOverlaySong] = useState<Song | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      const { data: songsData } = await supabase
        .from("songs")
        .select("*")
        .order("mosaic_position");

      setSongs(songsData || []);

      if (user) {
        const { data: unlocked } = await supabase
          .from("user_songs")
          .select("song_id")
          .eq("user_id", user.id);

        const ids = unlocked?.map((u) => u.song_id) || [];
        setUnlockedIds(ids);

        // 🏁 detectar álbum completo (una sola vez)
        if (ids.length === 9 && !localStorage.getItem("album_completed_seen")) {
          const { data: completed } = await supabase
            .from("album_completions")
            .select("user_id")
            .eq("user_id", user.id)
            .single();

          if (completed) {
            setShowCongrats(true);
            localStorage.setItem("album_completed_seen", "true");
          }
        }
      }

      setLoading(false);
    };

    init();
  }, []);

  if (loading) {
    return <p style={{ padding: 20 }}>Cargando álbum…</p>;
  }

  const now = new Date();

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 16 }}>Mi álbum</h1>

      {/* MOSAICO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          maxWidth: 600,
          border: "1px solid #ccc",
        }}
      >
        {Array.from({ length: 9 }).map((_, index) => {
          const song =
            songs.find((s) => s.mosaic_position === index + 1) || null;

          if (!song) {
            return (
              <div
                key={index}
                style={{
                  aspectRatio: "1 / 1",
                  border: "1px solid #ddd",
                }}
              />
            );
          }

          const isLaunched = now >= new Date(song.launch_start);
          const isUnlocked = unlockedIds.includes(song.id);

          return (
            <div
              key={index}
              onClick={() => {
                if (isUnlocked) {
                  setActiveSong(song);
                } else if (isLaunched) {
                  setOverlaySong(song);
                }
              }}
              style={{
                aspectRatio: "1 / 1",
                border: "1px solid #ddd",
                background: "#f5f5f5",
                cursor:
                  isUnlocked || isLaunched ? "pointer" : "default",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {isUnlocked && song.cover_path && (
                <img
                  src={song.cover_path}
                  alt={song.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}

              {!isUnlocked && isLaunched && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  🔒
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* REPRODUCTOR */}
      {activeSong?.audio_url && (
        <div style={{ marginTop: 24 }}>
          <h2>{activeSong.title}</h2>
          <audio
            src={activeSong.audio_url}
            controls
            autoPlay
            style={{ width: "100%" }}
          />
        </div>
      )}

      {/* OVERLAY INTERCAMBIO */}
      {overlaySong && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setOverlaySong(null)}
        >
          <div
            style={{
              background: "#111",
              padding: 32,
              maxWidth: 420,
              textAlign: "center",
              borderRadius: 8,
            }}
          >
            <h2 style={{ marginBottom: 16 }}>
              Esta canción ya está circulando
            </h2>
            <p style={{ marginBottom: 24 }}>
              Para desbloquearla necesitás conseguir la figurita
              física.
              <br />
              Andá a cambiar con tus amigos.
            </p>
            <button onClick={() => setOverlaySong(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* 🎉 FELICITACIONES */}
      {showCongrats && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "#111",
              padding: 40,
              maxWidth: 480,
              textAlign: "center",
              borderRadius: 12,
            }}
          >
            <h1 style={{ marginBottom: 24 }}>Gracias</h1>
            <p style={{ marginBottom: 24 }}>
              Gracias por acompañarme durante todo este recorrido.
              <br />
              Este álbum existe por el tiempo, los encuentros
              <br />
              y las manos que lo hicieron circular.
            </p>

            <button onClick={() => setShowCongrats(false)}>
              Volver al álbum
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

