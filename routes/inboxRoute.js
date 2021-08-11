const router = require("express").Router();

const { isAuthenticated } = require("../middleware/authMiddleware");

const {GetInbox} = require("../controllers/inboxController");

router.get("/", isAuthenticated, GetInbox);

module.exports = router;