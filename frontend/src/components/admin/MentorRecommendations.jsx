const TAG_COLOR_MAP = {
  react: "bg-sky-500/10 text-sky-400 border-sky-500/25",
  "node.js": "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  typescript: "bg-blue-500/10 text-blue-400 border-blue-500/25",
  javascript: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  azure: "bg-sky-500/10 text-sky-400 border-sky-500/25",
  java: "bg-orange-500/10 text-orange-400 border-orange-500/25",
  kubernetes: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
  figma: "bg-pink-500/10 text-pink-400 border-pink-500/25",
  "adobe xd": "bg-rose-500/10 text-rose-400 border-rose-500/25",
  mongodb: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  postgresql: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  "c++": "bg-purple-500/10 text-purple-400 border-purple-500/25",
  seo: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  "content writing": "bg-teal-500/10 text-teal-400 border-teal-500/25",
  "data science": "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
  "full stack development": "bg-teal-500/10 text-teal-400 border-teal-500/25",
  "mobile development": "bg-purple-500/10 text-purple-400 border-purple-500/25",
  "cloud architecture": "bg-sky-500/10 text-sky-400 border-sky-500/25",
  devops: "bg-orange-500/10 text-orange-400 border-orange-500/25",
};

const COLOR_PALETTES = [
  "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
  "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  "bg-amber-500/10 text-amber-400 border-amber-500/25",
  "bg-purple-500/10 text-purple-400 border-purple-500/25",
  "bg-teal-500/10 text-teal-400 border-teal-500/25",
  "bg-rose-500/10 text-rose-400 border-rose-500/25",
  "bg-sky-500/10 text-sky-400 border-sky-500/25",
];

function getTagStyle(tagStr) {
  if (!tagStr) return COLOR_PALETTES[0];
  const key = tagStr.toLowerCase().trim();
  if (TAG_COLOR_MAP[key]) return TAG_COLOR_MAP[key];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLOR_PALETTES[Math.abs(hash) % COLOR_PALETTES.length];
}

function getInitials(name) {
  if (!name) return "M";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function MatchScoreRing({ score }) {
  const isHigh = score >= 90;
  const isMed = score >= 80;

  const color = isHigh
    ? {
        stroke: "#10b981",
        text: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/25",
        label: "text-emerald-400/80",
      }
    : isMed
    ? {
        stroke: "#38bdf8",
        text: "text-sky-400",
        bg: "bg-sky-500/10 border-sky-500/25",
        label: "text-sky-400/80",
      }
    : {
        stroke: "#c084fc",
        text: "text-purple-400",
        bg: "bg-purple-500/10 border-purple-500/25",
        label: "text-purple-400/80",
      };

  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${color.bg} shrink-0`}>
      <div className="relative flex items-center justify-center w-7 h-7">
        <svg className="w-7 h-7 transform -rotate-90">
          <circle
            cx="14"
            cy="14"
            r={radius}
            className="stroke-white/10"
            strokeWidth="3"
            fill="transparent"
          />
          <circle
            cx="14"
            cy="14"
            r={radius}
            stroke={color.stroke}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className={`absolute text-[10px] font-extrabold ${color.text}`}>
          {score}
        </span>
      </div>
      <div className="flex flex-col text-left leading-tight pr-0.5">
        <span className={`text-[11px] font-bold tracking-tight ${color.text}`}>
          {score}%
        </span>
        <span className={`text-[9px] uppercase tracking-wider font-semibold ${color.label}`}>
          Match
        </span>
      </div>
    </div>
  );
}

export function MentorRecommendations({
  recommendations,
  loading,
  selectedMentor,
  onSelectMentor,
  onEditMentor,
}) {
  if (!recommendations && !loading) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="grid gap-3 overflow-y-auto max-h-[420px] pr-1.5 mq-scroll">
        {loading ? (
          <div className="mq-card p-4 text-center">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400 mb-2" />
            <p className="text-xs text-ink-400 font-medium">Finding best mentor recommendations...</p>
          </div>
        ) : recommendations?.recommendations ? (
          recommendations.recommendations.map((rec) => {
            const mentor = rec.mentor;
            const isSelected =
              selectedMentor &&
              (selectedMentor._id === mentor._id || selectedMentor.id === mentor.id);

            // Combine tags & top expertise to display rich colored pills
            const displayTags = [
              ...(mentor.tags || []),
              ...(mentor.expertise || []).filter(
                (exp) => !(mentor.tags || []).includes(exp)
              ),
            ].slice(0, 4);

            return (
              <div
                key={mentor._id || mentor.id}
                onClick={() => onSelectMentor(isSelected ? null : mentor)}
                className={`group relative rounded-xl border p-3.5 text-left transition-all duration-200 cursor-pointer w-full ${
                  isSelected
                    ? "border-emerald-500/50 bg-emerald-950/20 shadow-[0_4px_20px_rgba(16,185,129,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-emerald-500/30"
                    : "border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.05] hover:border-white/[0.15]"
                }`}
              >
                {/* Selection Indicator Pill */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    <svg className="w-3 h-3 stroke-emerald-400 fill-none" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Selected
                  </div>
                )}

                {/* Header: Avatar, Info, Match Ring */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 pr-16">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/15 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-xs font-bold text-ink-50 tracking-wider">
                        {getInitials(mentor.name)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-ink-50 truncate group-hover:text-white transition-colors">
                        {mentor.name}
                      </h3>
                      <p className="text-xs text-ink-400 truncate flex items-center gap-1">
                        {mentor.designation && (
                          <span className="font-medium text-ink-300">{mentor.designation}</span>
                        )}
                        {mentor.company && (
                          <>
                            <span className="text-ink-500">@</span>
                            <span className="text-emerald-400 font-semibold">{mentor.company}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {!isSelected && <MatchScoreRing score={rec.score} />}
                </div>

                {/* Highlights Bar: Experience, Target Role, Edit Tags & LinkedIn */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-[11px]">
                  {isSelected && <MatchScoreRing score={rec.score} />}

                  {mentor.experience != null && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-ink-300 font-medium">
                      <svg className="w-3 h-3 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.4V14.15m16.5 0a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25m16.5 0v-4.25c0-.621-.504-1.125-1.125-1.125H4.875A1.125 1.125 0 003.75 9.9v4.25m16.5 0h-16.5" />
                      </svg>
                      {mentor.experience} yrs exp
                    </span>
                  )}

                  {mentor.targetRole && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-ink-300 font-medium truncate max-w-[140px]">
                      🎯 {mentor.targetRole}
                    </span>
                  )}

                  {onEditMentor && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditMentor(mentor);
                      }}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      title="Edit mentor tags and description"
                    >
                      ✏️ Edit Tags
                    </button>
                  )}

                  {mentor.linkedin && (
                    <a
                      href={mentor.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="ml-auto inline-flex items-center gap-1 rounded-md bg-blue-500/10 border border-blue-500/25 px-2 py-0.5 text-[10px] font-semibold text-blue-400 hover:bg-blue-500/20 transition-colors"
                    >
                      LinkedIn ↗
                    </a>
                  )}
                </div>

                {/* Tags Section: Vibrant Colorful Pill Badges */}
                {displayTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {displayTags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors ${getTagStyle(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Why Recommended Callout Box */}
                {rec.reasons?.length > 0 && (
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-xs">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mb-1">
                      <span>✨</span>
                      <span>Why Recommended</span>
                    </div>
                    <p className="text-ink-400 text-[11px] leading-relaxed line-clamp-2" title={rec.reasons[0]}>
                      {rec.reasons[0]}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : null}
      </div>
    </div>
  );
}

