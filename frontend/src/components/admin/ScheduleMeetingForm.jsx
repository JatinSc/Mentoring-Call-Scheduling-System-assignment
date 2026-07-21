
import { useState, useMemo, useCallback, useEffect } from "react";
import { DateTime } from "luxon";
import * as adminApi from "../../api/admin";
import * as meetingsApi from "../../api/meetings";
import { isPastDateTime } from "../../utils/time";
import MqSelect from "../MqSelect";

const SCHEDULE_HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const val = String(i).padStart(2, "0");
  const amPm = i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`;
  return { value: val, label: `${val}:00 (${amPm})` };
});
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

export function ScheduleMeetingForm({
  userEmail,
  mentorEmail,
  adminEmail,
  callType,
  displayTimezone,
  onScheduleSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [additionalEmails, setAdditionalEmails] = useState([""]);
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleStartHour, setScheduleStartHour] = useState("");
  const [scheduleStartMinute, setScheduleStartMinute] = useState("");
  const [scheduleEndHour, setScheduleEndHour] = useState("");
  const [scheduleEndMinute, setScheduleEndMinute] = useState("");

  const meetingZone =
    displayTimezone === "IST" ? "Asia/Kolkata" : "Europe/Dublin";

  const todayMinDate = useMemo(() => {
    return DateTime.now().setZone(meetingZone).toFormat("yyyy-MM-dd");
  }, [meetingZone]);

  const scheduleStartDt = useMemo(() => {
    if (!scheduleDate || !scheduleStartHour || !scheduleStartMinute) return null;
    const dt = DateTime.fromFormat(
      `${scheduleDate} ${scheduleStartHour}:${scheduleStartMinute}`,
      "yyyy-MM-dd HH:mm",
      { zone: meetingZone },
    );
    return dt.isValid ? dt : null;
  }, [
    scheduleDate,
    scheduleStartHour,
    scheduleStartMinute,
    meetingZone,
  ]);

  const scheduleEndDt = useMemo(() => {
    if (!scheduleDate || !scheduleEndHour || !scheduleEndMinute) return null;
    const dt = DateTime.fromFormat(
      `${scheduleDate} ${scheduleEndHour}:${scheduleEndMinute}`,
      "yyyy-MM-dd HH:mm",
      { zone: meetingZone },
    );
    return dt.isValid ? dt : null;
  }, [
    scheduleDate,
    scheduleEndHour,
    scheduleEndMinute,
    meetingZone,
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
        setScheduleEndHour("");
        setScheduleEndMinute("");
        setInlineError("");
        setAdditionalEmails([""]);

        onScheduleSuccess?.();
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
      scheduleEndHour,
      scheduleEndMinute,
      scheduleStartDt,
      scheduleEndDt,
      scheduleStartIso,
      meetingZone,
      getParticipantEmails,
      onScheduleSuccess,
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
  );
  const removeAdditionalEmail = useCallback((i) =>
    setAdditionalEmails((p) => p.filter((_, idx) => idx !== i)),
  );

  return (
    <form onSubmit={handleScheduleMeeting} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">
          Meeting Title
        </label>
        <input
          type="text"
          value={scheduleTitle}
          onChange={(e) => setScheduleTitle(e.target.value)}
          placeholder="e.g. Mentoring Session"
          className="w-full h-10 rounded-lg bg-slate-900 border border-slate-800 text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Date
          </label>
          <input
            type="date"
            min={todayMinDate}
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="w-full h-10 rounded-lg bg-slate-900 border border-slate-800 text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Start Time (24h)
          </label>
          <div className="flex gap-2">
            <MqSelect
              id="form-start-hour"
              value={scheduleStartHour}
              onChange={setScheduleStartHour}
              placeholder="Hour"
              options={SCHEDULE_HOUR_OPTIONS}
              className="relative flex-1 min-w-0"
            />
            <MqSelect
              id="form-start-minute"
              value={scheduleStartMinute}
              onChange={setScheduleStartMinute}
              placeholder="Min"
              options={SCHEDULE_MINUTE_OPTIONS}
              className="relative flex-1 min-w-0"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            End Time (24h)
          </label>
          <div className="flex gap-2">
            <MqSelect
              id="form-end-hour"
              value={scheduleEndHour}
              onChange={setScheduleEndHour}
              placeholder="Hour"
              options={SCHEDULE_HOUR_OPTIONS}
              className="relative flex-1 min-w-0"
            />
            <MqSelect
              id="form-end-minute"
              value={scheduleEndMinute}
              onChange={setScheduleEndMinute}
              placeholder="Min"
              options={SCHEDULE_MINUTE_OPTIONS}
              className="relative flex-1 min-w-0"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            User Email
          </label>
          <input
            type="email"
            value={userEmail}
            disabled
            className="w-full h-10 rounded-lg bg-slate-800/50 border border-slate-800 text-slate-400 px-3 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Mentor Email
          </label>
          <input
            type="email"
            value={mentorEmail}
            disabled
            className="w-full h-10 rounded-lg bg-slate-800/50 border border-slate-800 text-slate-400 px-3 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Admin Email
          </label>
          <input
            type="email"
            value={adminEmail}
            disabled
            className="w-full h-10 rounded-lg bg-slate-800/50 border border-slate-800 text-slate-400 px-3 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-400">
            Additional Emails
          </label>
          <button
            type="button"
            onClick={addAdditionalEmail}
            className="text-xs text-blue-400 hover:text-blue-300"
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
              className="flex-1 h-10 rounded-lg bg-slate-900 border border-slate-800 text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {idx > 0 && (
              <button
                type="button"
                onClick={() => removeAdditionalEmail(idx)}
                className="h-10 px-3 rounded-lg bg-slate-800 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {inlineError && (
        <div className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {inlineError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:hover:bg-slate-800 text-white font-medium transition flex items-center justify-center"
      >
        {loading ? "Scheduling..." : "Schedule Meeting"}
      </button>
    </form>
  );
}
