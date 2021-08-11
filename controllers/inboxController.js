const Profile = require("../models/Profile");

const Flash = require("../utils/Flash");

exports.GetInbox = async (req, res, next) => {

    console.log("Hitting inbox route");

    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile)
        return res.redirect("/dashboard/create-profile");

    res.render("pages/inbox/inboxPage", {
        title: "Inbox",
        error: {},
        flashMessage: {},
        value: {}
    });
};