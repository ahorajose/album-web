import { Suspense } from "react";
import UnlockClient from "./UnlockClient";

export default function UnlockPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Cargando canción…</div>}>
      <UnlockClient />
    </Suspense>
  );
}

