const pool = require("../config/db");
const AppError = require("../utils/AppError");
const { v4: uuidv4 } = require("uuid");

const createMeeting = async (req, res, next) => {
  try {
    const { courseId, title, description, scheduledAt, durationMinutes, maxParticipants, isRecurring, recurringPattern } = req.body;
    const meetingId = uuidv4().slice(0, 8);
    const passcode = Math.floor(100000 + Math.random() * 900000).toString();
    const meetingUrl = ``;

    const result = await pool.query(
      `INSERT INTO meetings (course_id, teacher_id, title, description, meeting_url, meeting_id, passcode, scheduled_at, duration_minutes, max_participants, is_recurring, recurring_pattern)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [courseId, req.userId, title, description, meetingUrl, meetingId, passcode, scheduledAt, durationMinutes || 60, maxParticipants || 100, isRecurring || false, recurringPattern || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

const getMeetings = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    let query = `SELECT m.*, c.title as course_title, u.first_name || ' ' || u.last_name as teacher_name
                 FROM meetings m JOIN courses c ON m.course_id = c.id
                 JOIN users u ON m.teacher_id = u.id WHERE 1=1`;
    const params = [];
    let p = 1;
    if (courseId) { query += ` AND m.course_id = $${p++}`; params.push(courseId); }
    query += ` ORDER BY m.scheduled_at DESC`;
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
};

const getMeetingById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT m.*, c.title as course_title, u.first_name || ' ' || u.last_name as teacher_name
       FROM meetings m JOIN courses c ON m.course_id = c.id
       JOIN users u ON m.teacher_id = u.id WHERE m.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) throw new AppError("Meeting not found", 404);

    const attendees = await pool.query(
      `SELECT ma.*, u.first_name || ' ' || u.last_name as user_name, u.avatar_url
       FROM meeting_attendees ma JOIN users u ON ma.user_id = u.id WHERE ma.meeting_id = $1`,
      [req.params.id]
    );
    result.rows[0].attendees = attendees.rows;

    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

const updateMeeting = async (req, res, next) => {
  try {
    const { title, description, scheduledAt, durationMinutes, maxParticipants, status, recordingUrl } = req.body;
    const result = await pool.query(
      `UPDATE meetings SET title = COALESCE($1, title), description = COALESCE($2, description), scheduled_at = COALESCE($3, scheduled_at),
       duration_minutes = COALESCE($4, duration_minutes), max_participants = COALESCE($5, max_participants),
       status = COALESCE($6, status), recording_url = COALESCE($7, recording_url) WHERE id = $8 RETURNING *`,
      [title, description, scheduledAt, durationMinutes, maxParticipants, status, recordingUrl, req.params.id]
    );
    if (result.rows.length === 0) throw new AppError("Meeting not found", 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

const deleteMeeting = async (req, res, next) => {
  try {
    const result = await pool.query("DELETE FROM meetings WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rows.length === 0) throw new AppError("Meeting not found", 404);
    res.json({ success: true, message: "Meeting deleted" });
  } catch (error) { next(error); }
};

const joinMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const meeting = await pool.query("SELECT * FROM meetings WHERE id = $1 AND status IN ('scheduled', 'live')", [meetingId]);
    if (meeting.rows.length === 0) throw new AppError("Meeting not found or not available", 404);

    const isHost = req.userRole === "teacher" || req.userRole === "admin" || req.userRole === "super-admin";

    await pool.query(
      "INSERT INTO meeting_attendees (meeting_id, user_id, joined_at, is_host) VALUES ($1, $2, NOW(), $3) ON CONFLICT DO NOTHING",
      [meetingId, req.userId, isHost]
    );

    // Auto-track attendance for students
    if (req.userRole === "student") {
      const enrollment = await pool.query(
        "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status = 'active'",
        [req.userId, meeting.rows[0].course_id]
      );
      if (enrollment.rows.length > 0) {
        await pool.query(
          `INSERT INTO attendance (meeting_id, enrollment_id, student_id, status, check_in_time)
           VALUES ($1, $2, $3, 'present', NOW())
           ON CONFLICT (meeting_id, enrollment_id, student_id)
           DO UPDATE SET status = 'present', check_in_time = NOW(), notes = NULL`,
          [meetingId, enrollment.rows[0].id, req.userId]
        );
      }
    }

    res.json({ success: true, data: meeting.rows[0] });
  } catch (error) { next(error); }
};

const leaveMeeting = async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE meeting_attendees SET left_at = NOW(), duration_seconds = EXTRACT(EPOCH FROM (NOW() - joined_at)) WHERE meeting_id = $1 AND user_id = $2 AND left_at IS NULL RETURNING *`,
      [req.params.meetingId, req.userId]
    );

    // Update attendance record with check_out_time and duration
    if (result.rows.length > 0 && result.rows[0].duration_seconds > 0) {
      await pool.query(
        `UPDATE attendance SET check_out_time = NOW() WHERE meeting_id = $1 AND student_id = $2 AND check_out_time IS NULL`,
        [req.params.meetingId, req.userId]
      );
    }

    res.json({ success: true, message: "Left meeting" });
  } catch (error) { next(error); }
};

const getMeetingAttendance = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    // Get enrolled students for this meeting's course
    const enrolled = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.avatar_url, e.id as enrollment_id
       FROM enrollments e JOIN users u ON e.user_id = u.id
       WHERE e.course_id = (SELECT course_id FROM meetings WHERE id = $1)
       AND e.status = 'active'
       ORDER BY u.first_name, u.last_name`,
      [meetingId]
    );

    // Get attendance records for this meeting
    const attendances = await pool.query(
      `SELECT * FROM attendance WHERE meeting_id = $1`,
      [meetingId]
    );
    const attMap = {};
    attendances.rows.forEach(a => { attMap[a.student_id] = a; });

    // Merge: enrich students with their attendance info
    const data = enrolled.rows.map(s => ({
      ...s,
      attendance: attMap[s.id] || null,
    }));

    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const markMeetingAttendance = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const { studentId, status, notes } = req.body;

    const enrollment = await pool.query(
      `SELECT e.id FROM enrollments e JOIN meetings m ON e.course_id = m.course_id
       WHERE m.id = $1 AND e.user_id = $2 AND e.status = 'active'`,
      [meetingId, studentId]
    );
    if (enrollment.rows.length === 0) throw new AppError("Student not enrolled in this course", 400);

    const result = await pool.query(
      `INSERT INTO attendance (meeting_id, enrollment_id, student_id, status, marked_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (meeting_id, enrollment_id, student_id)
       DO UPDATE SET status = $4, marked_by = $5, notes = COALESCE($6, attendance.notes)
       RETURNING *`,
      [meetingId, enrollment.rows[0].id, studentId, status || "present", req.userId, notes]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

module.exports = {
  createMeeting, getMeetings, getMeetingById, updateMeeting, deleteMeeting, joinMeeting, leaveMeeting,
  getMeetingAttendance, markMeetingAttendance,
};
