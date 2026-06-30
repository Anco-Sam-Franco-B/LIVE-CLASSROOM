const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meetingController");
const { authenticate, requirePermission } = require("../middleware/auth");

router.get("/", authenticate, meetingController.getMeetings);
router.get("/:id", authenticate, meetingController.getMeetingById);
router.post("/", authenticate, requirePermission("create-meetings"), meetingController.createMeeting);
router.put("/:id", authenticate, requirePermission("edit-meetings"), meetingController.updateMeeting);
router.delete("/:id", authenticate, requirePermission("delete-meetings"), meetingController.deleteMeeting);
router.post("/:meetingId/join", authenticate, meetingController.joinMeeting);
router.post("/:meetingId/leave", authenticate, meetingController.leaveMeeting);
router.get("/:meetingId/attendance", authenticate, meetingController.getMeetingAttendance);
router.post("/:meetingId/attendance", authenticate, requirePermission("take-attendance"), meetingController.markMeetingAttendance);

module.exports = router;
