// src/lib/saveActivity.ts
export async function saveActivity(type: string, details?: string) {
  try {
    // include credentials so Clerk session cookie is sent
    const res = await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ type, details }),
    });
    if (!res.ok) {
      // optional: read body for debugging
      let text = "";
      try { text = await res.text(); } catch {}
      console.error("saveActivity failed:", res.status, text);
    }
    return res;
  } catch (err) {
    console.error("saveActivity error:", err);
    return null;
  }
}

export default saveActivity;
