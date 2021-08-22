const Profile = require("../models/Profile");

const Flash = require("../utils/Flash");

exports.getInbox = async (req, res, next) => {

    // console.log(`Client logger-> ip: ${req.ip} Host: ${req.host} Method: ${req.method}`);

    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile)
        return res.redirect("/dashboard/create-profile");

    let courses = await Profile.findOne({user: req.user._id})
                                .populate('course')
                                .populate('joinedClass')
                                .select({course: 1, _id: 0});
    
    let conversationList = [...courses?.course, ...courses?.joinedClass];

    // console.log("conversationList: ", conversationList);
        

    res.render("pages/inbox/inboxPage", {
        title: "Inbox",
        error: {},
        flashMessage: {},
        value: conversationList,
        conversations: {}
    });
};

exports.getConversationById = (req, res, next) => {

    let conversationId = req.params.conversationId;

    console.log("conversationId: ", conversationId);

    res.render("pages/inbox/inboxPage", {
        title: "Conversations",
        error: {},
        flashMessage: {},
        conversations: {},
        value: {}
    });};