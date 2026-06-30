const express = require("express");
const router = express.Router();
const livekitController = require("../controllers/livekitController");
const { authenticate, requirePermission } = require("../middleware/auth");

router.get("/token/:meetingId", authenticate, livekitController.generateToken);
router.post("/room", authenticate, requirePermission("create-meetings"), livekitController.createRoom);
router.get("/room/:id/participants", authenticate, livekitController.getParticipants);
router.delete("/room/:id", authenticate, requirePermission("delete-meetings"), livekitController.endRoom);

module.exports = router;
