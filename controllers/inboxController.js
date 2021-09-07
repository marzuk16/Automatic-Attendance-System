const Profile = require("../models/Profile");
const Course = require("../models/Course");
const Conversation = require("../models/Conversation");

const Flash = require("../utils/Flash");

exports.getInbox = async (req, res, next) => {

    // console.log(`Client logger-> ip: ${req.ip} Host: ${req.host} Method: ${req.method}`);

    try {
        let profile = await Profile.findOne({ user: req.user._id });
        if (!profile)
            return res.redirect("/dashboard/create-profile");

            let courses = await Profile.findOne({user: req.user._id})
                                        .populate('course')
                                        .populate('joinedClass')
                                        .select({course: 1, _id: 0});
            
            // own created courses and joined courses
            let conversationList = [...courses?.course, ...courses?.joinedClass];

            // console.log("conversationList: ", conversationList);
                
            res.render("pages/inbox/inboxPage", {
                title: "Inbox",
                error: {},
                flashMessage: {},
                value: conversationList,
                conversations: {},
                conversationName: {}
            });
        
    } catch (error) {
        next(error)
    }
};

exports.getConversationById = async (req, res, next) => {

    let conversationId = req.params.conversationId;

    console.log("conversationId: ", conversationId);

    try {
        let profile = await Profile.findOne({ user: req.user._id });
        if (!profile)
            return res.redirect("/dashboard/create-profile");

        // let course = await Course.findById({$and: [{_id: conversationId }, {$or: [{author: req.user._id}, {joinedStudent: req.user._id}]}]});
        let course = await Course.findById({_id: conversationId });
        
        console.log("course: ", course);

        let allConversations = [];
        if(req.user._id != course.author || course.joinedStudent.indexOf(req.user._id) === -1){
            //authorize user for this conversation

            allConversations = await Conversation.find({course: conversationId}).sort({"createdAt": -1});
            console.log("all conversations inside: ", allConversations);
        }

        console.log("all conversations: ", allConversations);

        //for extract all conversation to user perticipated
        let courses = await Profile.findOne({user: req.user._id})
                                        .populate('course')
                                        .populate('joinedClass')
                                        .select({course: 1, _id: 0});
            
        // own created courses and joined courses
        let conversationList = [...courses?.course, ...courses?.joinedClass];

        let conversationName = course.title + " - " + course.batch;

        res.render("pages/inbox/inboxPage", {
            title: "Conversations",
            error: {},
            flashMessage: {},
            conversations: allConversations,
            value: conversationList,
            conversationName
        });
        
    } catch (error) {
        next(error);
    }
};