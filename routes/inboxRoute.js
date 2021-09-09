const router = require("express").Router();
const multer = require("multer");
const upload = multer();

const { isAuthenticated } = require("../middleware/authMiddleware");

const {
    inboxGetController,
    sendMessagePostController,
    getMessages,
    searchConversation
} = require("../controllers/inboxController");

router.get("/", isAuthenticated,  inboxGetController);

router.post("/search", isAuthenticated, searchConversation);

router.get("/messages/:conversation_id", isAuthenticated, getMessages);
router.post("/send-message", isAuthenticated, upload.none(), sendMessagePostController);

module.exports = router;