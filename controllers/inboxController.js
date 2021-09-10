const Profile = require("../models/Profile");
const Course = require("../models/Course");
const Conversation = require("../models/Conversation");


const opOverLoad = (a, b) => {

  return a.lastMessageUpdate < b.lastMessageUpdate ? 1 : -1;
};

exports.inboxGetController = async (req, res, next) => {

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

            res.locals.conversationList = conversationList.sort(opOverLoad);

            console.log("conversationList: ", res.locals.conversationList);

            // emit socket event
            global.io.emit("update_conversation", res.locals.conversationList);
                
            res.render("pages/inbox/inbox", {
                title: "Inbox",
                error: {},
                flashMessage: {}
            });
        
    } catch (error) {
        next(error)
    }
};

// get messages of a conversation
exports.getMessages = async (req, res, next) => {

    try {
      const messages = await Conversation.find({
        course: req.params.conversation_id,
      }).sort("-createdAt");
  
      const { author, joinedStudent } = await Course.findById(
        req.params.conversation_id
      );
  
      res.status(200).json({
        data: {
          messages,
          participant: [author, ...joinedStudent],
        },
        user: req.user.userId,
        conversation_id: req.params.conversation_id,
      });
    } catch (err) {
      res.status(500).json({
        errors: {
          common: {
            msg: "Unknows error occured!",
          },
        },
      });
    }
  }

// send new message
exports.sendMessagePostController = async (req, res, next) => {   

    if (req.body.message){

      try {

        // save message text in database
        const newMessage = new Conversation({
          message: req.body.message,
          sender: {
            id: req.user._id,
            name: req.user.userId,
            profilePics: req.user.profilePics,
          },
          course: req.body.conversationId,
        });
        
        const result = await newMessage.save();
        await Course.findByIdAndUpdate({_id: req.body.conversationId}, {lastMessageUpdate: Date.now()});

        // emit socket event
        global.io.emit("new_message", {
          message: {
            course: req.body.conversationId,
            sender: {
              id: req.user._id,
              name: req.user.userId,
              profilePics: req.user.profilePics,
            },
            message: req.body.message,
            date_time: result.date_time,
          },
        });
  
        res.status(200).json({
          message: "Successful!",
          data: result,
        });
      } catch (err) {
        res.status(500).json({
          errors: {
            common: {
              msg: err.message,
            },
          },
        });
      }
    } else {
      res.status(500).json({
        errors: {
          common: "message text is required!",
        },
      });
    }
  }
  
// search conversation
exports.searchConversation = async (req, res, next) => {

  const conversationSearch = req.body.conversation;
  // console.log("search string: ", conversationSearch);
  try {
    if (conversationSearch !== "") {

      const conversationList = await Course.find(
        {
          $or: [
            {
              title: conversationSearch,
            },
            {
              batch: conversationSearch,
            },
            {
              term: conversationSearch,
            },
          ],
        }
      );

      res.json(conversationList);

    } else {
      throw createError("You must provide some text to search!");
    }
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}