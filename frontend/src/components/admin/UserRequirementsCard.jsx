export function UserRequirementsCard({ user }) {
  if (!user) return null;

  const hasGoals = user.goals && user.goals.trim();
  const hasSkills = Array.isArray(user.skills) && user.skills.length > 0;
  const hasInterests = Array.isArray(user.interests) && user.interests.length > 0;
  const hasTags = Array.isArray(user.tags) && user.tags.length > 0;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 space-y-2 text-left transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-ink-300">
              {user.name ? user.name.slice(0, 2).toUpperCase() : "U"}
            </span>
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-xs text-ink-50 truncate">
              {user.name}’s Profile
            </h4>
            <p className="text-[11px] text-ink-500 truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Career Stage & Target Role Badges */}
        <div className="flex flex-wrap items-center gap-1 shrink-0 text-[10px]">
          {user.targetRole && (
            <span className="rounded bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-ink-300 font-medium">
              🎯 {user.targetRole}
            </span>
          )}
          {user.careerStage && (
            <span className="rounded bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-ink-400 font-medium">
              {user.careerStage}
            </span>
          )}
        </div>
      </div>

      {/* User Goals */}
      {hasGoals && (
        <div className="rounded-lg bg-white/[0.025] border border-white/[0.05] p-2 text-xs">
          <span className="font-semibold text-ink-400 text-[11px] block mb-0.5">
            Career Goal
          </span>
          <p className="text-ink-300 text-[11px] leading-relaxed">
            {user.goals}
          </p>
        </div>
      )}

      {/* Bio */}
      {user.bio && (
        <p className="text-[11px] text-ink-400 leading-normal line-clamp-2">
          <span className="font-medium text-ink-300">Bio: </span>
          {user.bio}
        </p>
      )}

      {/* Skills, Interests & Tags */}
      {(hasSkills || hasInterests || hasTags) && (
        <div className="flex flex-wrap gap-1 pt-0.5 text-[10px]">
          {hasSkills &&
            user.skills.map((skill) => (
              <span
                key={skill}
                className="rounded bg-white/[0.04] border border-white/[0.07] px-1.5 py-0.5 text-ink-400"
              >
                {skill}
              </span>
            ))}

          {hasInterests &&
            user.interests.map((interest) => (
              <span
                key={interest}
                className="rounded bg-white/[0.04] border border-white/[0.07] px-1.5 py-0.5 text-ink-400"
              >
                {interest}
              </span>
            ))}

          {hasTags &&
            user.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-white/[0.04] border border-white/[0.07] px-1.5 py-0.5 text-ink-400"
              >
                {tag}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

