import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const savedState = sessionStorage.getItem("oauth_state");

    if (!code || state !== savedState) {
      navigate("/");
      return;
    }

    // Exchange code for token via backend
    fetch("/api/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        code_verifier: sessionStorage.getItem("pkce_verifier"),
        redirect_uri: import.meta.env.VITE_REDIRECT_URI,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.access_token) {
          localStorage.setItem("afaq_access_token", data.access_token);
          localStorage.setItem("afaq_refresh_token", data.refresh_token || "");
        }
        navigate("/");
      })
      .catch(() => navigate("/"));
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "4rem", fontFamily: "system-ui" }}>
      <div style={{ fontSize: 14, color: "#888" }}>Signing you in...</div>
    </div>
  );
}
