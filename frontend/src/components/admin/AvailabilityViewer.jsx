
import { useMemo, useCallback } from "react";
import { DateTime } from "luxon";
import { formatTimeRange } from "../../utils/time";
import { ScheduledMeetings } from "./ScheduledMeetings";

const parseHmToMinutes = (hm) => {
  if (!hm) return null;
  const [hStr, mStr] = hm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const minutesToHm = (minutes) => {
  let total = minutes;
  if (total < 0) total = 0;
  if (total > 1440) total = 1440;
  if (total === 1440) total = 0;
  const h = Math.floor(total / 60);
  const m = total % 60;
  const hh = h.toString().padStart(2, "0");
  const mm = m.toString().padStart(2, "0");
  return `${hh}:${mm}`;
};

const computeCommonSlotsForDay = (userSlots = [], mentorSlots = []) => {
  const results = [];
  for (const u of userSlots) {
    const uStart = parseHmToMinutes(u.convertedStart);
    const uEndRaw = parseHmToMinutes(u.convertedEnd);
    if (uStart == null || uEndRaw == null) continue;
    let uEnd = uEndRaw;
    if (uEnd <= uStart) uEnd += 1440;

    for (const m of mentorSlots) {
      const mStart = parseHmToMinutes(m.convertedStart);
      const mEndRaw = parseHmToMinutes(m.convertedEnd);
      if (mStart == null || mEndRaw == null) continue;
      let mEnd = mEndRaw;
      if (mEnd <= mStart) mEnd += 1440;

      let start = Math.max(uStart, mStart, 0);
      let end = Math.min(uEnd, mEnd, 1440);

      if (end <= start) continue;

      const startHm = minutesToHm(start);
      const endHm = minutesToHm(end);
      results.push({ startHm, endHm });
    }
  }
  return results;
};

const flattenSlots = (data) => {
  if (!data) return [];
  return Object.entries(data.availability || {}).flatMap(([dateStr, slots]) =>
    (slots || []).map((s) => ({ ...s, dateStr })),
  );
};

const groupFlatSlotsByLocalDate = (slots, timezone) => {
  if (!Array.isArray(slots) || slots.length === 0) {
    return { dates: [], byDate: {} };
  }
  const byDate = {};
  for (const slot of slots) {
    const localStart = DateTime.fromISO(slot.startTime, { zone: "utc" }).setZone(timezone);
    const localEnd = slot.endTime
      ? DateTime.fromISO(slot.endTime, { zone: "utc" }).setZone(timezone)
      : null;
    const localDateKey = localStart.toFormat("yyyy-MM-dd");
    const convertedStart = localStart.toFormat("HH:mm");
    const convertedEnd = localEnd ? localEnd.toFormat("HH:mm") : "";

    if (!byDate[localDateKey]) {
      const dayLabel = localStart.toFormat("ccc, dd LLL");
      byDate[localDateKey] = { dayLabel, slots: [] };
    }

    byDate[localDateKey].slots.push({
      ...slot,
      convertedStart,
      convertedEnd,
    });
  }

  return { dates: Object.keys(byDate).sort(), byDate };
};

export function AvailabilityViewer({
  selectedUser,
  selectedMentor,
  userAvailability,
  mentorAvailability,
  loadingUserAvail,
  loadingMentorAvail,
  displayTimezone,
  meetings,
  onSelectCommonSlot,
}) {
  const selectedTimezone =
    displayTimezone === "IST" ? "Asia/Kolkata" : "Europe/Dublin";

  const upcomingDays = useMemo(() => {
    const today = DateTime.now().setZone(selectedTimezone).startOf("day");
    return Array.from({ length: 7 }, (_, i) => {
      const d = today.plus({ days: i });
      return {
        key: d.toFormat("yyyy-MM-dd"),
        label: d.toFormat("ccc, dd LLL"),
      };
    });
  }, [selectedTimezone]);

  const meetingsByDate = useMemo(() => {
    if (!Array.isArray(meetings) || meetings.length === 0) return {};
    const byDate = {};
    for (const m of meetings) {
      if (!m.startTime) continue;
      const start = DateTime.fromISO(m.startTime, { zone: "utc" }).setZone(
        selectedTimezone,
      );
      const end = m.endTime
        ? DateTime.fromISO(m.endTime, { zone: "utc" }).setZone(selectedTimezone)
        : null;
      const key = start.toFormat("yyyy-MM-dd");
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push({
        ...m,
        localStartLabel: start.toFormat("h:mm a"),
        localEndLabel: end ? end.toFormat("h:mm a") : "",
      });
    }
    Object.keys(byDate).forEach((k) => {
      byDate[k].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
    });
    return byDate;
  }, [meetings, selectedTimezone]);

  const userSlotsFlat = useMemo(() => flattenSlots(userAvailability), [userAvailability]);
  const mentorSlotsFlat = useMemo(() => flattenSlots(mentorAvailability), [mentorAvailability]);

  const userByLocalDate = useMemo(
    () => groupFlatSlotsByLocalDate(userSlotsFlat, selectedTimezone),
    [userSlotsFlat, selectedTimezone],
  );

  const mentorByLocalDate = useMemo(
    () => groupFlatSlotsByLocalDate(mentorSlotsFlat, selectedTimezone),
    [mentorSlotsFlat, selectedTimezone],
  );

  const availabilityTarget = selectedUser || selectedMentor;

  return (
    <div className="mq-card overflow-hidden p-4 flex flex-col">
      {
        loadingUserAvail || loadingMentorAvail ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-ink-500 text-sm">
              Loading availability...
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                {selectedUser && (
                  <span className="text-ink-400 text-sm">
                    User: {selectedUser.name}
                  </span>
                )}
                {selectedUser && selectedMentor && (
                  <span className="text-ink-600">|</span>
                )}
                {selectedMentor && (
                  <span className="text-ink-400 text-sm">
                    Mentor: {selectedMentor.name}
                  </span>
                )}
              </div>
              <div className="text-ink-500 text-xs">
                Showing today and next 6 days ({displayTimezone})
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full border-collapse table-auto">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="py-4 px-4 text-left text-sm font-semibold text-ink-50 w-[150px] whitespace-nowrap">
                      Date
                    </th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-ink-50 whitespace-nowrap">
                      User Availability
                    </th>
                    <th className="py-4 px-4 text-left text-xs md:text-sm font-semibold text-ink-50 whitespace-nowrap">
                      Mentor Availability
                    </th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-ink-50 whitespace-nowrap">
                      Common Times
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingDays.map(({ key, label }, index) => {
                    const userSlots =
                      userByLocalDate.byDate[key]?.slots ?? [];
                    const mentorSlots =
                      mentorByLocalDate.byDate[key]?.slots ?? [];
                    const commonIntervals = computeCommonSlotsForDay(
                      userSlots,
                      mentorSlots,
                    );
                    const rowBg =
                      index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent";
                    return (
                      <tr
                        key={key}
                        className={`${rowBg} border-b border-white/[0.05]`}
                      >
                        <td className="py-4 px-4 text-sm font-semibold text-ink-50 whitespace-nowrap align-middle">
                          {label}
                        </td>
                        <td className="py-4 px-4 text-sm text-ink-400 align-top">
                          {userSlots.length === 0 ? (
                            <span className="text-ink-600">
                              No availability
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {userSlots.map((slot) => (
                                <span
                                  key={slot.startTime}
                                  className="inline-flex items-center rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-1 text-xs text-ink-50"
                                >
                                  {formatTimeRange(
                                    `${slot.convertedStart} – ${slot.convertedEnd}`,
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-ink-400 align-top">
                          {mentorSlots.length === 0 ? (
                            <span className="text-ink-600">
                              No availability
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {mentorSlots.map((slot) => (
                                <span
                                  key={slot.startTime}
                                  className="inline-flex items-center rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-1 text-xs text-ink-50"
                                >
                                  {formatTimeRange(
                                    `${slot.convertedStart} – ${slot.convertedEnd}`,
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-ink-50 align-top">
                          {commonIntervals.length === 0 ? (
                            <span className="text-ink-600">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {commonIntervals.map(
                                ({ startHm, endHm }, idx) => {
                                  const slotKey = `${key}-${startHm}-${endHm}`;
                                  return (
                                    <button
                                      key={slotKey}
                                      type="button"
                                      onClick={() =>
                                        onSelectCommonSlot?.({
                                          key,
                                          startHm,
                                          endHm,
                                        })
                                      }
                                      className="inline-flex items-center rounded-md border border-sky-400/30 bg-emerald-950 px-2 py-1 text-xs bg-sky-500/10 text-sky-400 border-sky-500/25transition hover:text-sky-500"
                                    >
                                      {formatTimeRange(
                                        `${startHm} – ${endHm}`,
                                      )}
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
    </div>
  );
}
