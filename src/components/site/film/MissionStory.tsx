import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ActOpening } from "./acts/ActOpening";
import { ActLandscape } from "./acts/ActLandscape";
import { ActSense } from "./acts/ActSense";
import { ActOps } from "./acts/ActOps";
import { ActOversight } from "./acts/ActOversight";
import { ActNavigate } from "./acts/ActNavigate";
import { ActInvestigate } from "./acts/ActInvestigate";
import { ActConfirm } from "./acts/ActConfirm";
import { ActSuppress } from "./acts/ActSuppress";
import { ActReassess } from "./acts/ActReassess";
import { ActHandoff } from "./acts/ActHandoff";
import { ActSystem } from "./acts/ActSystem";
import { ActFuture } from "./acts/ActFuture";
import { FilmFallback } from "./FilmFallback";

const UavStage = lazy(() => import("./UavStage"));

type Mode = "pending" | "film" | "reduced";

function pickMode(): Mode {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 860px)").matches;
  const lowPower =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined &&
    ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) < 4;
  return reduce || small || lowPower ? "reduced" : "film";
}

/** The public film: twelve acts, one scroll engine, one WebGL context. */
export function MissionStory() {
  const [mode, setMode] = useState<Mode>("pending");

  useEffect(() => {
    const update = () => setMode(pickMode());
    update();
    const mqs = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(max-width: 860px)"),
    ];
    mqs.forEach((m) => m.addEventListener("change", update));
    return () => mqs.forEach((m) => m.removeEventListener("change", update));
  }, []);

  if (mode === "pending" || mode === "reduced") {
    return (
      <>
        <FilmFallback />
        <ActFuture />
      </>
    );
  }

  return (
    <>
      <span className="film-progress" aria-hidden />
      <ClientOnly fallback={null}>
        <Suspense fallback={null}>
          <UavStage />
        </Suspense>
      </ClientOnly>

      <ActOpening />
      <ActLandscape />
      <ActSense />
      <ActOps />
      <ActOversight />
      <ActNavigate />
      <ActInvestigate />
      <ActConfirm />
      <ActSuppress />
      <ActReassess />
      <ActHandoff />
      <ActSystem />
      <ActFuture />
    </>
  );
}
