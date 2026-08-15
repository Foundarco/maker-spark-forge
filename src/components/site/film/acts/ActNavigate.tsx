import { useEffect, useRef } from "react";
import { Act } from "../Act";
import { uav } from "../uav";
import { win } from "../useFilmScroll";
import { act } from "@/config/acts";
import incident from "@/assets/journey-incident-flight.mp4.asset.json";
import canyon from "@/assets/j-canyon.jpg";

const copy = act("navigate");

/** Format: motion video plate + the aircraft flying its assigned route. */
export function ActNavigate() {
  const video = useRef<HTMLVideoElement>(null);
  const playing = useRef(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        playing.current = true;
        void el.play().catch(() => {});
      } else if (playing.current) {
        playing.current = false;
        el.pause();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Act
      id="act-navigate"
      label={copy.title}
      vh={240}
      frame={(p) => {
        uav.reveal = 0;
        uav.t = 0.44 + p * 0.16;
        uav.weight = win(p, 0.05, 0.22, 0.7, 0.95);
        uav.bank = Math.sin(p * Math.PI) * 0.12;
      }}
      stageClassName="bg-[#080d14]"
    >
      <video
        ref={video}
        className="act-media"
        muted
        loop
        playsInline
        preload="none"
        poster={canyon}
        aria-label="Low flight through a forested canyon"
      >
        <source src={incident.url} type="video/mp4" />
      </video>
      <div className="act-grade-warm" aria-hidden />

      <div className="act-copy act-copy-right">
        <p className="act-kicker text-[var(--signal)]">
          <span>{copy.code}</span>
          <span className="act-rule" />
          {copy.kicker}
        </p>
        <h2 className="act-title">{copy.title}</h2>
        <p className="act-line">{copy.line}</p>
        <p className="act-detail">Route assigned · operator monitoring</p>
      </div>
    </Act>
  );
}
