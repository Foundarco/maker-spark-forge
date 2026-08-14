import { Act } from "../Act";
import { OversightLockup } from "../OversightLockup";
import { acts } from "@/config/acts";

const copy = acts[4]!;

/** Format: no photograph. Pure diagram — the one moment the site explains itself. */
export function ActOversight() {
  return (
    <Act
      id="act-oversight"
      label={copy.title}
      vh={170}
      stageClassName="bg-[radial-gradient(120%_90%_at_50%_0%,#12202f_0%,#060a11_62%)]"
    >
      <div className="act-grid" aria-hidden />
      <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-5 sm:px-8">
        <p className="act-kicker text-ink/70">
          <span>{copy.code}</span>
          <span className="act-rule" />
          {copy.kicker}
        </p>
        <h2 className="act-title mt-4 max-w-3xl">{copy.title}</h2>
        <p className="act-line max-w-xl">{copy.line}</p>
        <div className="mt-9 act-fade-up">
          <OversightLockup />
        </div>
        <p className="act-detail max-w-xl">{copy.detail}</p>
      </div>
    </Act>
  );
}
