
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import * as adminApi from "../api/admin";
import * as availabilityApi from "../api/availability";
import * as meetingsApi from "../api/meetings";
import AddUserModal from "../components/AddUserModal";
import AddMentorModal from "../components/AddMentorModal";
import { UserSearch } from "../components/admin/UserSearch";
import { CallTypeSelector } from "../components/admin/CallTypeSelector";
import { MentorRecommendations } from "../components/admin/MentorRecommendations";
import { AvailabilityViewer } from "../components/admin/AvailabilityViewer";
import { ScheduledMeetings } from "../components/admin/ScheduledMeetings";
import { ScheduleMeetingModal } from "../components/admin/ScheduleMeetingModal";
import { EditMentorModal } from "../components/admin/EditMentorModal";
import { UserRequirementsCard } from "../components/admin/UserRequirementsCard";
import MqSelect from "../components/MqSelect";

const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "GMT (GMT+0)" },
  { value: "IST", label: "IST (GMT+5:30)" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("schedule");
  const { user: authUser } = useAuth();
  const [adminEmail, setAdminEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [displayTimezone, setDisplayTimezone] = useState("UTC");
  const [callType, setCallType] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const base = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    return base.toISOString().slice(0, 10);
  });
  const emptyAvailability = useMemo(
    () => ({ dates: [], availability: {} }),
    [],
  );
  const [userAvailability, setUserAvailability] = useState(() => ({
    dates: [],
    availability: {},
  }));
  const [mentorAvailability, setMentorAvailability] = useState(() => ({
    dates: [],
    availability: {},
  }));
  const [loadingUserAvail, setLoadingUserAvail] = useState(false);
  const [loadingMentorAvail, setLoadingMentorAvail] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [mentorEmail, setMentorEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddMentorModal, setShowAddMentorModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingMentor, setEditingMentor] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      const [u, m] = await Promise.all([
        adminApi.listUsers(),
        adminApi.listMentors(),
      ]);
      setUsers(u);
      setMentors(m);
    } catch (e) {
      setError(e.message || "Failed to load users");
    }
  }, []);

  const loadUserAvailability = useCallback(async () => {
    if (!selectedUser) {
      setUserAvailability(emptyAvailability);
      return;
    }
    setLoadingUserAvail(true);
    setError("");
    try {
      const data = await availabilityApi.getWeekly({
        userId: selectedUser.id,
        weekStart,
      });
      setUserAvailability(data);
    } catch (e) {
      setError(e.message || "Failed to load user availability");
      setUserAvailability(emptyAvailability);
    } finally {
      setLoadingUserAvail(false);
    }
  }, [selectedUser, weekStart, emptyAvailability]);

  const loadMentorAvailability = useCallback(async () => {
    if (!selectedMentor) {
      setMentorAvailability(emptyAvailability);
      return;
    }
    setLoadingMentorAvail(true);
    setError("");
    try {
      const data = await availabilityApi.getWeekly({
        mentorId: selectedMentor.id,
        weekStart,
      });
      setMentorAvailability(data);
    } catch (e) {
      setError(e.message || "Failed to load mentor availability");
      setMentorAvailability(emptyAvailability);
    } finally {
      setLoadingMentorAvail(false);
    }
  }, [selectedMentor, weekStart, emptyAvailability]);

  const loadMeetings = useCallback(async () => {
    try {
      const list = await meetingsApi.listMeetings();
      setMeetings(list);
    } catch {
      setMeetings([]);
    }
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setAdminEmail(storedEmail);
    } else if (authUser?.email) {
      setAdminEmail(authUser.email);
    }
  }, [authUser?.email]);

  useEffect(() => {
    loadUsers();
    loadMeetings();
  }, [loadUsers, loadMeetings]);

  useEffect(() => {
    if (!selectedUser) {
      setUserAvailability(emptyAvailability);
    }
  }, [selectedUser, emptyAvailability]);
  useEffect(() => {
    if (!selectedMentor) {
      setMentorAvailability(emptyAvailability);
    }
  }, [selectedMentor, emptyAvailability]);

  useEffect(() => {
    loadUserAvailability();
  }, [loadUserAvailability]);
  useEffect(() => {
    loadMentorAvailability();
  }, [loadMentorAvailability]);

  useEffect(() => {
    if (selectedUser) setUserEmail(selectedUser.email);
  }, [selectedUser]);
  useEffect(() => {
    if (selectedMentor) setMentorEmail(selectedMentor.email);
  }, [selectedMentor]);

  const fetchRecommendations = useCallback(async () => {
    if (!selectedUser || !callType) {
      setRecommendations(null);
      return;
    }

    setLoadingRecommendations(true);
    try {
      const data = await adminApi.getRecommendations({
        userId: selectedUser.id,
        callType,
      });
      setRecommendations(data);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setRecommendations(null);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [selectedUser, callType]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleScheduleSuccess = useCallback(() => {
    setSuccess("Meeting scheduled successfully!");
    loadMeetings();
    setTimeout(() => setSuccess(""), 3000);
  }, [loadMeetings]);

  const handleSelectCommonSlot = useCallback(() => {
    setShowScheduleModal(true);
  }, []);

  const canOpenScheduler = selectedUser && selectedMentor && callType;

  return (
    <div className="">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">
          {success}
        </div>
      )}

      <div className="flex flex-col w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink-50">
              {activeTab === "schedule" ? "Admin Dashboard" : "Scheduled Meetings"}
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              {activeTab === "schedule" ? "Manage users, mentor recommendations, and scheduling with the same availability workspace theme." : "View and manage all booked mentoring sessions."}
            </p>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("schedule")}
                  className={`h-10 rounded-lg px-4 text-sm font-medium transition ${activeTab === "schedule"
                    ? "bg-white/[0.1] text-ink-50 border border-white/[0.12]"
                    : "bg-white/[0.04] text-ink-500 border border-white/[0.08] hover:bg-white/[0.07] hover:text-ink-50"
                    }`}
                >
                  Schedule Call
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("meetings")}
                  className={`h-10 rounded-lg px-4 text-sm font-medium transition ${activeTab === "meetings"
                    ? "bg-white/[0.1] text-ink-50 border border-white/[0.12]"
                    : "bg-white/[0.04] text-ink-500 border border-white/[0.08] hover:bg-white/[0.07] hover:text-ink-50"
                    }`}
                >
                  Scheduled Meetings
                </button>
              </div>

              <div className="w-44">
                {/* <select
                  value={displayTimezone}
                  onChange={(e) => setDisplayTimezone(e.target.value)}
                  className="mq-input"
                >
                  {TIMEZONE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select> */}
                <MqSelect
                  id="display-timezone"
                  label=""
                  value={displayTimezone}
                  onChange={setDisplayTimezone}
                  options={TIMEZONE_OPTIONS}
                  className={`relative w-full min-w-0 sm:w-44 sm:shrink-0 ${true ? "sm:ml-auto" : ""}`}
                  labelClassName="text-right"
                  menuAlign="right"
                />
              </div>
            </div>
          </div>
        </div>
        <div>
          {activeTab === "schedule" ? (
            <div className="w-full space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              </div>
              <div className="flex flex-row gap-2">
                <div className="mq-card w-[40%] space-y-4 p-4">
                  <div className="flex flex-row gap-2 items-end">
                    <UserSearch
                      users={users}
                      selectedUser={selectedUser}
                      onSelectUser={(user) => {
                        setSelectedUser(user);
                        setSelectedMentor(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(true)}
                      className="mq-btn-secondary"
                    >
                      Add
                    </button>
                  </div>

                  {selectedUser && (
                    <UserRequirementsCard user={selectedUser} />
                  )}

                  <CallTypeSelector
                    callType={callType}
                    onSelectCallType={setCallType}
                  />

                  <div className="space-y-3">
                    <div className="flex flex-row justify-between items-center">
                      <label className="mq-label">Recommended Mentors</label>
                      <button
                        type="button"
                        onClick={() => setShowAddMentorModal(true)}
                        className="mq-btn-secondary"
                      >Add</button>
                    </div>
                    <MentorRecommendations
                      recommendations={recommendations}
                      loading={loadingRecommendations}
                      selectedMentor={selectedMentor}
                      onSelectMentor={setSelectedMentor}
                      onEditMentor={(mentorToEdit) => setEditingMentor(mentorToEdit)}
                    />
                  </div>
                </div>
                <div className="mq-card w-[60%] p-5">
                  <AvailabilityViewer
                    selectedUser={selectedUser}
                    selectedMentor={selectedMentor}
                    userAvailability={userAvailability}
                    mentorAvailability={mentorAvailability}
                    loadingUserAvail={loadingUserAvail}
                    loadingMentorAvail={loadingMentorAvail}
                    displayTimezone={displayTimezone}
                    meetings={meetings}
                    onSelectCommonSlot={handleSelectCommonSlot}
                  />
                </div>
              </div>

            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              </div>

              <div className="mq-card p-5">
                <ScheduledMeetings
                  meetings={meetings}
                  displayTimezone={displayTimezone}
                  onMeetingDeleted={loadMeetings}
                  onMeetingCanceled={loadMeetings}
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {showAddUserModal && (
        <AddUserModal onClose={() => setShowAddUserModal(false)} />
      )}
      {showAddMentorModal && (
        <AddMentorModal onClose={() => setShowAddMentorModal(false)} />
      )}
      {editingMentor && (
        <EditMentorModal
          open={Boolean(editingMentor)}
          mentor={editingMentor}
          onClose={() => setEditingMentor(null)}
          onSuccess={() => {
            fetchRecommendations();
            loadUsers();
          }}
        />
      )}
      <ScheduleMeetingModal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        userEmail={userEmail}
        mentorEmail={mentorEmail}
        adminEmail={adminEmail}
        callType={callType}
        displayTimezone={displayTimezone}
        onSuccess={handleScheduleSuccess}
      />
    </div>
  );
}
