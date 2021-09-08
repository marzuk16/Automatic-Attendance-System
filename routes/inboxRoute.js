const router = require("express").Router();

const { isAuthenticated } = require("../middleware/authMiddleware");

const {
    inboxGetController,
    conversationByIdGetController,
    sendMessagePostController
} = require("../controllers/inboxController");

router.get("/", isAuthenticated,  inboxGetController);
router.get("/conversations/:conversationId", isAuthenticated, conversationByIdGetController);

router.post("/send-message", isAuthenticated, sendMessagePostController);

module.exports = router;