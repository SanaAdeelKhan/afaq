import { useEffect, useRef } from "react";

export default function StarField() {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML = "";
    
    for (let i = 0; i < 100; i++) {
      const star = document.createElement("div");
      const size = Math.random() * 2 + 1;
      const opacity = Math.random() * 0.5 + 0.1;
      const duration = Math.random() * 4 + 2;
      const delay = Math.random() * 6;
      
      star.style.cssText = `
        position:absolute;
        border-radius:50%;
        background:#fff;
        width:${size}px;
        height:${size}px;
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        opacity:0;
        animation:twinkle ${duration}s ease-in-out ${delay}s infinite;
        --op:${opacity};
      `;
      container.appendChild(star);
    }
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position:"fixed",
        inset:0,
        pointerEvents:"none",
        zIndex:0,
        overflow:"hidden"
      }}
    />
  );
}
