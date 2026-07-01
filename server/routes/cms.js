const express = require("express");
const router = express.Router();
const cmsController = require("../controllers/cmsController");
const { authenticate, requirePermission } = require("../middleware/auth");

router.get("/", authenticate, requirePermission("view-cms"), cmsController.getCmsPages);
router.get("/:page", authenticate, requirePermission("view-cms"), cmsController.getCmsPage);
router.put("/:page/:section", authenticate, requirePermission("edit-cms"), cmsController.updateCmsSection);
router.patch("/:page/:section/toggle", authenticate, requirePermission("edit-cms"), cmsController.toggleCmsSection);
router.delete("/:page/:section", authenticate, requirePermission("edit-cms"), cmsController.resetCmsSection);

router.get("/public/:page", cmsController.getPublicCmsContent);

module.exports = router;
