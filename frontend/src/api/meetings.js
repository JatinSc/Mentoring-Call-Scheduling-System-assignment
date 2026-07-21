import { get, put, del } from "./client.js";

export async function listMeetings(params = {}) {
  const q = new URLSearchParams(params).toString();
  return get(`/api/meetings${q ? `?${q}` : ""}`);
}

export async function cancelMeeting(meetingId) {
  return put(`/api/meetings/cancel/${meetingId}`);
}

export async function deleteMeeting(meetingId) {
  return del(`/api/meetings/${meetingId}`);
}
