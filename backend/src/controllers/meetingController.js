import { Meeting } from "../models/index.js";

export async function listMeetings(req, res, next) {
  try {
    const { adminId, from, to } = req.query;
    const where = {};
    if (adminId) where.adminId = adminId;
    if (from) where.startTime = { $gte: new Date(from) };
    if (to) where.endTime = { $lte: new Date(to) };

    const meetings = await Meeting.find(where).sort({ startTime: 1 });
    res.json(meetings);
  } catch (e) {
    next(e);
  }
}

export const cancelMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findByIdAndUpdate(
      id,
      { status: "Cancelled" },
      { new: true, runValidators: true }
    );

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Meeting cancelled successfully",
      data: meeting,
    });
  } catch (error) {
    console.error("Error cancelling meeting:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel meeting",
      error: error.message,
    });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findByIdAndDelete(id);
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

    res.status(200).json({
      success: true,
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    console.error("Delete meeting error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete meeting",
    });
  }
};
