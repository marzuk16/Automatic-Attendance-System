const router = require("express").Router();

const { isAuthenticated } = require("../middleware/authMiddleware");

const {
    getInbox,
    getConversationById
} = require("../controllers/inboxController");

router.get("/", isAuthenticated, getInbox);
router.get("/conversations/:conversationId", getConversationById);

module.exports = router;