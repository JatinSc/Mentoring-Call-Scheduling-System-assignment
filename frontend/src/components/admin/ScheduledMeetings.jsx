import { useState, useMemo } from "react";
import { DateTime } from "luxon";
import { cancelMeeting, deleteMeeting } from "../../api/meetings";

const TABS = ["Upcoming", "Past", "Canceled"];

export function ScheduledMeetings({
  meetings = [],
  displayTimezone = "UTC",
  onMeetingDeleted,
  onMeetingCancelled,
  onMeetingCanceled,
}) {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);

  const selectedTimezone = displayTimezone === "IST" ? "Asia/Kolkata" : "Europe/Dublin";
  const tzLabel = displayTimezone === "IST" ? "IST" : "GMT";

  // Filter meetings by tab
  const filteredMeetings = useMemo(() => {
    if (!Array.isArray(meetings)) return [];
    const now = Date.now();

    return meetings.filter((m) => {
      const startTimeMs = m.startTime ? new Date(m.startTime).getTime() : 0;
      const status = (m.status || "Scheduled").toLowerCase();

      switch (activeTab) {
        case "Upcoming":
          return status !== "cancelled" && status !== "completed" && startTimeMs >= now;
        case "Past":
          return status === "completed" || (status !== "cancelled" && startTimeMs < now);
        case "Canceled":
          return status === "cancelled";
        default:
          return true;
      }
    });
  }, [meetings, activeTab]);

  // Paginated meetings for List View
  const totalPages = Math.ceil(filteredMeetings.length / rowsPerPage) || 1;
  const paginatedMeetings = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredMeetings.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredMeetings, currentPage, rowsPerPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleDeleteMeeting = async (meetingId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;

    setDeletingId(meetingId);
    try {
      await deleteMeeting(meetingId);
      if (selectedMeeting?.id === meetingId || selectedMeeting?._id === meetingId) {
        setSelectedMeeting(null);
      }
      if (onMeetingDeleted) onMeetingDeleted();
    } catch (err) {
      alert(err.message || "Failed to delete meeting");
    } finally {
      setDeletingId(null);
      setActionMenuOpenId(null);
    }
  };

  const handleCancelMeeting = async (meetingId, e) => {
    if (e) e.stopPropagation();

    const res = window.confirm("Cancel this meeting?");
    if (!res) return;

    setCancelingId(meetingId);
    try {
      await cancelMeeting(meetingId);
      if (selectedMeeting?.id === meetingId || selectedMeeting?._id === meetingId) {
        setSelectedMeeting(null);
      }
      const cb = onMeetingCancelled || onMeetingCanceled;
      if (cb) cb();
      alert("Meeting cancelled successfully.");
    } catch (error) {
      alert(error.message || "Failed to cancel meeting.");
    } finally {
      setCancelingId(null);
      setActionMenuOpenId(null);
    }
  };

  const formatMeetingDate = (isoString) => {
    if (!isoString) return "";
    const dt = DateTime.fromISO(isoString, { zone: "utc" }).setZone(selectedTimezone);
    return dt.toFormat("dd LLL yyyy");
  };

  const formatMeetingTimeRange = (startIso, endIso) => {
    if (!startIso) return "";
    const start = DateTime.fromISO(startIso, { zone: "utc" }).setZone(selectedTimezone);
    const end = endIso ? DateTime.fromISO(endIso, { zone: "utc" }).setZone(selectedTimezone) : null;
    const startStr = start.toFormat("h:mma").toLowerCase();
    const endStr = end ? end.toFormat("h:mma").toLowerCase() : "";
    return endStr ? `${startStr} - ${endStr}` : startStr;
  };

  const formatParticipants = (participants) => {
    if (!Array.isArray(participants) || participants.length === 0) return "No participants";
    const emails = participants.map((p) => p.email || p.name || "Unknown");
    if (emails.length === 1) return emails[0];
    if (emails.length === 2) return `${emails[0]} and ${emails[1]}`;
    return `${emails[0]}, ${emails[1]} +${emails.length - 2} more`;
  };

  const isPastMeeting = (m) => {
    if (!m?.startTime) return false;
    return new Date(m.startTime).getTime() < Date.now() || (m.status || "").toLowerCase() === "completed";
  };

  return (
    <div className="space-y-4">
      {/* Header Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0 mq-scroll">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedMeeting(null)
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${isActive
                  ? "bg-white/[0.12] text-ink-50 font-semibold shadow-sm"
                  : "text-ink-500 hover:text-ink-200 hover:bg-white/[0.04]"
                  }`}
              >
                {tab}
              </button>
            );
          })}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-400 hover:text-ink-100 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
        </div>
      </div>

      {/* Content Body: Empty State / List View / Grid View */}
      {filteredMeetings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] mb-3 text-ink-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-ink-50">No {activeTab.toLowerCase()} bookings</h4>
          <p className="mt-1 text-xs text-ink-500 max-w-sm">
            You have no {activeTab.toLowerCase()} bookings. As soon as someone books a time with you it will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            {paginatedMeetings.map((m) => {
              const isSelected = selectedMeeting?.id === m.id || selectedMeeting?._id === m._id;
              const dateStr = formatMeetingDate(m.startTime);
              const timeStr = formatMeetingTimeRange(m.startTime, m.endTime);
              const participantsStr = formatParticipants(m.participants);

              return (
                <div
                  key={m.id || m._id}
                  onClick={() => setSelectedMeeting(isSelected ? null : m)}
                  className={`rounded-xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition ${isSelected
                    ? "border-primary-500/50 bg-white/[0.07] shadow-lg"
                    : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                >
                  {/* Left Column: Date & Time */}
                  <div className="sm:w-1/4 shrink-0">
                    <p className="text-sm font-semibold text-ink-50">{dateStr}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{timeStr}</p>
                  </div>

                  {/* Middle Column: Title & Participants */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-50 truncate">{m.title}</p>
                    <p className="text-xs text-ink-400 truncate mt-0.5">{participantsStr}</p>
                  </div>

                  {/* Right Column: Call Type Badge & Action Menu */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {m.callType && (
                      <span className="text-[11px] px-2.5 py-1 rounded-full border border-white/[0.1] bg-white/[0.05] text-ink-300 font-medium hidden md:inline-block">
                        {m.callType}
                      </span>
                    )}

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuOpenId(actionMenuOpenId === (m.id || m._id) ? null : (m.id || m._id));
                        }}
                        className="p-1.5 rounded-lg text-ink-400 hover:text-ink-100 hover:bg-white/[0.08] transition"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>

                      {actionMenuOpenId === (m.id || m._id) && (
                        <div className="absolute right-0 mt-1 w-40 rounded-lg border border-white/[0.1] bg-navy-900 shadow-xl z-20 py-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMeeting(m);
                              setActionMenuOpenId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs text-ink-200 hover:bg-white/[0.08] transition"
                          >
                            View details
                          </button>

                          {!isPastMeeting(m) && (m.status || "").toLowerCase() !== "cancelled" && (
                            <>
                              <button
                                type="button"
                                disabled={cancelingId === (m.id || m._id)}
                                onClick={(e) => handleCancelMeeting(m.id || m._id, e)}
                                className="w-full text-left px-3 py-1.5 text-xs text-orange-400 hover:bg-orange-500/10 transition"
                              >
                                {cancelingId === (m.id || m._id) ? "Canceling..." : "Cancel meeting"}
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === (m.id || m._id)}
                                onClick={(e) => handleDeleteMeeting(m.id || m._id, e)}
                                className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition"
                              >
                                Delete meeting
                              </button>
                            </>

                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* List View Pagination Footer */}
          <div className="flex items-center justify-between border-t border-white/[0.08] pt-3 text-xs text-ink-400">
            <div className="flex items-center gap-2">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-ink-300 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span>rows per page</span>
            </div>

            <div className="flex items-center gap-3">
              <span>
                {Math.min((currentPage - 1) * rowsPerPage + 1, filteredMeetings.length)}-
                {Math.min(currentPage * rowsPerPage, filteredMeetings.length)} of {filteredMeetings.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed text-ink-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="p-1 rounded border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed text-ink-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Details Component (Rendered below grid/list when a meeting is clicked) */}
      {selectedMeeting && (
        <div className="mt-6 rounded-xl border border-white/[0.12] bg-white/[0.04] backdrop-blur-xl p-5 shadow-2xl relative space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-ink-50">Meeting Details</h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${selectedMeeting.status === "Cancelled"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : selectedMeeting.status === "Completed"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "bg-green-500/20 text-green-300 border border-green-500/30"
                  }`}
              >
                {selectedMeeting.status || "Scheduled"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedMeeting(null)}
              className="text-ink-400 hover:text-ink-50 p-1 rounded-lg hover:bg-white/[0.08] transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-ink-500 uppercase tracking-wider font-semibold text-[10px] mb-1">Title</p>
              <p className="text-sm font-medium text-ink-50">{selectedMeeting.title}</p>
            </div>

            <div>
              <p className="text-ink-500 uppercase tracking-wider font-semibold text-[10px] mb-1">Call Type</p>
              <p className="text-sm font-medium text-ink-100">{selectedMeeting.callType || "General Mentoring"}</p>
            </div>

            <div>
              <p className="text-ink-500 uppercase tracking-wider font-semibold text-[10px] mb-1">Date & Time</p>
              <p className="text-sm font-medium text-ink-100">
                {formatMeetingDate(selectedMeeting.startTime)} (
                {formatMeetingTimeRange(selectedMeeting.startTime, selectedMeeting.endTime)} {tzLabel})
              </p>
            </div>

            <div>
              <p className="text-ink-500 uppercase tracking-wider font-semibold text-[10px] mb-1">Participants</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {Array.isArray(selectedMeeting.participants) && selectedMeeting.participants.length > 0 ? (
                  selectedMeeting.participants.map((p, idx) => (
                    <span
                      key={p._id || idx}
                      className="px-2 py-0.5 rounded border border-white/[0.08] bg-white/[0.05] text-ink-200 text-xs"
                    >
                      {p.email || p.name}
                    </span>
                  ))
                ) : (
                  <span className="text-ink-500 italic">No participants listed</span>
                )}
              </div>
            </div>

            {selectedMeeting.meetingNotes && (
              <div className="md:col-span-2">
                <p className="text-ink-500 uppercase tracking-wider font-semibold text-[10px] mb-1">Meeting Notes</p>
                <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] text-ink-200 text-xs whitespace-pre-wrap">
                  {selectedMeeting.meetingNotes}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-white/[0.08] pt-3">
            {!isPastMeeting(selectedMeeting) && (selectedMeeting.status || "").toLowerCase() !== "cancelled" && (
              <>
                <button
                  type="button"
                  disabled={cancelingId === (selectedMeeting.id || selectedMeeting._id)}
                  onClick={(e) => handleCancelMeeting(selectedMeeting.id || selectedMeeting._id, e)}
                  className="px-4 py-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-medium transition"
                >
                  {cancelingId === (selectedMeeting.id || selectedMeeting._id) ? "Canceling..." : "Cancel Meeting"}
                </button>
                <button
                type="button"
                disabled={deletingId === (selectedMeeting.id || selectedMeeting._id)}
                onClick={(e) => handleDeleteMeeting(selectedMeeting.id || selectedMeeting._id, e)}
                className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium transition"
              >
                {deletingId === (selectedMeeting.id || selectedMeeting._id) ? "Deleting..." : "Delete Meeting"}
              </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setSelectedMeeting(null)}
              className="mq-btn-secondary py-2 text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
