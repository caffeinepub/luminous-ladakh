import { useLanguage } from "../../context/LanguageContext";
import type { Violation } from "../../types";

interface Props {
  violations: Violation[];
  userId: string;
}

const levelColors: Record<number, string> = {
  1: "text-yellow-400 bg-yellow-400/10",
  2: "text-orange-400 bg-orange-400/10",
  3: "text-orange-500 bg-orange-500/10",
  4: "text-red-400 bg-red-400/10",
  5: "text-red-500 bg-red-500/10",
  6: "text-red-600 bg-red-600/10",
  7: "text-red-700 bg-red-700/10",
};

export function ViolationCard({ violations, userId }: Props) {
  const { t } = useLanguage();
  const myViolations = violations.filter((v) => v.targetUserId === userId);
  const activeViolations = myViolations.filter((v) => !v.resolved);

  if (myViolations.length === 0) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-green-400 text-2xl">
          verified_user
        </span>
        <div>
          <p className="font-semibold text-green-400 text-sm">
            {t("noViolations", "Account in Good Standing")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("noViolations", "No violations on record")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-sm">
          {t("myViolations", "Violation Status")}
        </h3>
        {activeViolations.length > 0 && (
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
            {activeViolations.length} {t("active", "active")}
          </span>
        )}
      </div>
      {myViolations.map((v) => (
        <div
          key={v.id}
          className={`rounded-lg p-3 ${levelColors[v.level] || levelColors[1]}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold">
              {t("violationLevel", "Level")} {v.level}
            </span>
            {v.resolved && (
              <span className="text-xs text-green-400">
                ✓ {t("approved", "Resolved")}
              </span>
            )}
          </div>
          <p className="text-xs opacity-80">{v.reason}</p>
          <p className="text-xs opacity-60 mt-1">
            {new Date(v.timestamp).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
