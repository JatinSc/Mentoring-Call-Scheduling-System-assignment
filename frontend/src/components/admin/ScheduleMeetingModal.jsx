
import { useState, useMemo, useCallback, useEffect } from "react";
import { DateTime } from "luxon";
import * as adminApi from "../../api/admin";
import { isPastDateTime } from "../../utils/time";
import MqSelect from "../MqSelect";

const SCHEDULE_HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));
const SCHEDULE_MINUTE_OPTIONS = [
  "00",
  "05",
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "45",
  "50",
  "55",
].map((m) => ({ value: m, label: m }));
const SCHEDULE_AMPM_OPTIONS = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" },
];

export function ScheduleMeetingModal({
  open,
  onClose,
  userEmail,
  mentorEmail,
  adminEmail,
  callType,
  displayTimezone,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [additionalEmails, setAdditionalEmails] = useState([""]);
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleStartHour, setScheduleStartHour] = useState("");
  const [scheduleStartMinute, setScheduleStartMinute] = useState("");
  const [scheduleStartAmPm, setScheduleStartAmPm] = useState("");
  const [scheduleEndHour, setScheduleEndHour] = useState("");
  const [scheduleEndMinute, setScheduleEndMinute] = useState("");
  const [scheduleEndAmPm, setScheduleEndAmPm] = useState("");

  const to24From12 = useCallback((hourStr, minuteStr, amPm) => {
    if (!hourStr || !minuteStr || !amPm) return null;
    let h = parseInt(hourStr, 10);
    if (Number.isNaN(h)) return null;
    const ap = amPm.toUpperCase();
    if (ap === "AM") {
      if (h === 12) h = 0;
    } else if (ap === "PM") {
      if (h !== 12) h += 12;
    } else return null;
    return `${String(h).padStart(2, "0")}:${minuteStr}`;
  }, []);

  const meetingZone =
    displayTimezone === "IST" ? "Asia/Kolkata" : "Europe/Dublin";

  const scheduleStartDt = useMemo(() => {
    const hm = to24From12(
      scheduleStartHour,
      scheduleStartMinute,
      scheduleStartAmPm,
    );
    if (!scheduleDate || !hm) return null;
    const dt = DateTime.fromFormat(
      `${scheduleDate} ${hm}`,
      "yyyy-MM-dd HH:mm",
      { zone: meetingZone },
    );
    return dt.isValid ? dt : null;
  }, [
    scheduleDate,
    scheduleStartHour,
    scheduleStartMinute,
    scheduleStartAmPm,
    meetingZone,
    to24From12,
  ]);

  const scheduleEndDt = useMemo(() => {
    const hm = to24From12(scheduleEndHour, scheduleEndMinute, scheduleEndAmPm);
    if (!scheduleDate || !hm) return null;
    const dt = DateTime.fromFormat(
      `${scheduleDate} ${hm}`,
      "yyyy-MM-dd HH:mm",
      { zone: meetingZone },
    );
    return dt.isValid ? dt : null;
  }, [
    scheduleDate,
    scheduleEndHour,
    scheduleEndMinute,
    scheduleEndAmPm,
    meetingZone,
    to24From12,
  ]);

  const scheduleStartIso = scheduleStartDt?.toISO() ?? "";

  const getParticipantEmails = useCallback(() => {
    const list = [
      userEmail.trim(),
      mentorEmail.trim(),
      ...additionalEmails.map((e) => e.trim()),
    ].filter(Boolean);
    return list;
  }, [userEmail, mentorEmail, additionalEmails]);

  const handleScheduleMeeting = useCallback(
    async (e) => {
      e.preventDefault();
      setInlineError("");

      if (!callType) {
        setInlineError("Please select a call type.");
        return;
      }
      if (!scheduleTitle.trim()) {
        setInlineError("Meeting name is required.");
        return;
      }
      if (!scheduleDate) {
        setInlineError("Please select a date.");
        return;
      }
      if (
        !scheduleStartHour ||
        !scheduleStartMinute ||
        !scheduleStartAmPm
      ) {
        setInlineError("Please select a complete start time");
        return;
      }
      if (!scheduleEndHour || !scheduleEndMinute || !scheduleEndAmPm) {
        setInlineError("Please select a complete end time");
        return;
      }
      if (!scheduleStartDt || !scheduleEndDt) {
        setInlineError("Invalid date or time.");
        return;
      }
      if (scheduleEndDt.toMillis() <= scheduleStartDt.toMillis()) {
        setInlineError("End time must be after start time");
        return;
      }
      if (isPastDateTime(scheduleStartIso)) {
        setInlineError("Cannot schedule in the past.");
        return;
      }

      setLoading(true);
      try {
        const date = scheduleStartDt.toFormat("dd-MM-yyyy");
        const startTime = scheduleStartDt.toFormat("HH:mm");
        const endTime = scheduleEndDt.toFormat("HH:mm");
        const timezone = meetingZone;
        await adminApi.scheduleMeeting({
          title: scheduleTitle.trim(),
          date,
          startTime,
          endTime,
          timezone,
          participantEmails: getParticipantEmails(),
          callType,
        });

        setScheduleTitle("");
        setScheduleStartHour("");
        setScheduleStartMinute("");
        setScheduleStartAmPm("");
        setScheduleEndHour("");
        setScheduleEndMinute("");
        setScheduleEndAmPm("");
        setInlineError("");
        setAdditionalEmails([""]);

        onSuccess?.();
        onClose?.();
      } catch (err) {
        setInlineError(err.message || "Failed to schedule meeting");
      } finally {
        setLoading(false);
      }
    },
    [
      callType,
      scheduleTitle,
      scheduleDate,
      scheduleStartHour,
      scheduleStartMinute,
      scheduleStartAmPm,
      scheduleEndHour,
      scheduleEndMinute,
      scheduleEndAmPm,
      scheduleStartDt,
      scheduleEndDt,
      scheduleStartIso,
      meetingZone,
      getParticipantEmails,
      onSuccess,
      onClose,
    ],
  );

  const addAdditionalEmail = useCallback(() =>
    setAdditionalEmails((p) => [...p, ""]),
    []);
  const setAdditionalEmail = useCallback((i, v) =>
    setAdditionalEmails((p) => {
      const n = [...p];
      n[i] = v;
      return n;
    }),
    []);
  const removeAdditionalEmail = useCallback((i) =>
    setAdditionalEmails((p) => p.filter((_, idx) => idx !== i)),
    []);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setLoading(false);
      setInlineError("");
      setAdditionalEmails([""]);
      setScheduleTitle("");
      setScheduleDate("");
      setScheduleStartHour("");
      setScheduleStartMinute("");
      setScheduleStartAmPm("");
      setScheduleEndHour("");
      setScheduleEndMinute("");
      setScheduleEndAmPm("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-[60%] max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-white/[0.1] bg-navy-900 p-6 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-meeting-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3
            id="schedule-meeting-title"
            className="text-xl font-semibold tracking-tight text-ink-50"
          >
            Schedule a Meeting
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="mq-btn-icon"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {inlineError && (
          <div className="mb-4 shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {inlineError}
          </div>
        )}

        <form onSubmit={handleScheduleMeeting} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 pr-3 mq-scroll">
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5">
                Meeting Title
              </label>
              <input
                type="text"
                value={scheduleTitle}
                onChange={(e) => setScheduleTitle(e.target.value)}
                placeholder="e.g. Resume Review"
                className="w-full rounded-lg border border-white/10 bg-navy-800 px-3 py-2.5 text-sm text-ink-50 placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-navy-800 px-3 py-2.5 text-sm text-ink-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-500 mb-1.5">
                    Start Time
                  </label>
                  <div className="flex gap-2">
                    <MqSelect
                      id="schedule-start-hour"
                      value={scheduleStartHour}
                      onChange={setScheduleStartHour}
                      placeholder="Hour"
                      options={SCHEDULE_HOUR_OPTIONS}
                      className="relative flex-1 min-w-0"
                    />
                    <MqSelect
                      id="schedule-start-minute"
                      value={scheduleStartMinute}
                      onChange={setScheduleStartMinute}
                      placeholder="Min"
                      options={SCHEDULE_MINUTE_OPTIONS}
                      className="relative flex-1 min-w-0"
                    />
                    <MqSelect
                      id="schedule-start-ampm"
                      value={scheduleStartAmPm}
                      onChange={setScheduleStartAmPm}
                      placeholder="AM/PM"
                      options={SCHEDULE_AMPM_OPTIONS}
                      className="relative flex-1 min-w-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-500 mb-1.5">
                    End Time
                  </label>
                  <div className="flex gap-2">
                    <MqSelect
                      id="schedule-end-hour"
                      value={scheduleEndHour}
                      onChange={setScheduleEndHour}
                      placeholder="Hour"
                      options={SCHEDULE_HOUR_OPTIONS}
                      className="relative flex-1 min-w-0"
                    />
                    <MqSelect
                      id="schedule-end-minute"
                      value={scheduleEndMinute}
                      onChange={setScheduleEndMinute}
                      placeholder="Min"
                      options={SCHEDULE_MINUTE_OPTIONS}
                      className="relative flex-1 min-w-0"
                    />
                    <MqSelect
                      id="schedule-end-ampm"
                      value={scheduleEndAmPm}
                      onChange={setScheduleEndAmPm}
                      placeholder="AM/PM"
                      options={SCHEDULE_AMPM_OPTIONS}
                      className="relative flex-1 min-w-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5">
                  User Email
                </label>
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full rounded-lg border border-white/10 bg-navy-800/50 px-3 py-2.5 text-sm text-ink-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5">
                  Mentor Email
                </label>
                <input
                  type="email"
                  value={mentorEmail}
                  disabled
                  className="w-full rounded-lg border border-white/10 bg-navy-800/50 px-3 py-2.5 text-sm text-ink-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  disabled
                  className="w-full rounded-lg border border-white/10 bg-navy-800/50 px-3 py-2.5 text-sm text-ink-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-ink-500">
                  Additional Emails
                </label>
                <button
                  type="button"
                  onClick={addAdditionalEmail}
                  className="text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  + Add email
                </button>
              </div>
              {additionalEmails.map((email, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setAdditionalEmail(idx, e.target.value)}
                    placeholder="additional@example.com"
                    className="flex-1 rounded-lg border border-white/10 bg-navy-800 px-3 py-2.5 text-sm text-ink-50 placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => removeAdditionalEmail(idx)}
                      className="mq-btn-secondary"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4 shrink-0 border-t border-white/[0.08] mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mq-btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="mq-btn-primary flex-1"
            >
              {loading ? "Scheduling…" : "Schedule Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
