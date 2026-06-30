const pool = require("../config/db");
const AppError = require("../utils/AppError");
const { AccessToken, RoomServiceClient } = require("livekit-server-sdk");
const env = require("../config/env");

const roomService = new RoomServiceClient(env.LIVEKIT_HOST, env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET);

const generateToken = async (req, res, next) => {
  try {
    const meeting = await pool.query("SELECT * FROM meetings WHERE id = $1", [req.params.meetingId]);
    if (meeting.rows.length === 0) throw new AppError("Meeting not found", 404);

    const isModerator = req.userRole === "teacher" || req.userRole === "admin" || req.userRole === "super-admin";
    const roomName = meeting.rows[0].meeting_id;
    const identity = req.userId;
    const name = `${req.user.first_name} ${req.user.last_name}`;

    const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
      identity,
      name,
      ttl: "2h",
    });
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const tokenJwt = await at.toJwt();
    res.json({
      success: true,
      data: {
        token: tokenJwt,
        room: roomName,
        serverUrl: env.LIVEKIT_HOST,
      },
    });
  } catch (error) { next(error); }
};

const createRoom = async (req, res, next) => {
  try {
    const { name, emptyTimeout } = req.body;
    const room = await roomService.createRoom({
      name,
      emptyTimeout: emptyTimeout || 300,
      maxParticipants: req.body.maxParticipants || 100,
    });
    res.status(201).json({ success: true, data: room });
  } catch (error) { next(error); }
};

const getParticipants = async (req, res, next) => {
  try {
    const participants = await roomService.listParticipants(req.params.id);
    res.json({ success: true, data: participants });
  } catch (error) { next(error); }
};

const endRoom = async (req, res, next) => {
  try {
    await roomService.deleteRoom(req.params.id);
    res.json({ success: true, message: "Room ended" });
  } catch (error) { next(error); }
};

module.exports = { generateToken, createRoom, getParticipants, endRoom };
