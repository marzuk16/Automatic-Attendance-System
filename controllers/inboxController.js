const Profile = require("../models/Profile");
const Course = require("../models/Course");
const Conversation = require("../models/Conversation");

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

            // console.log("conversationList: ", conversationList);
            res.locals.conversationList = conversationList;
                
            res.render("pages/inbox/inbox", {
                title: "Inbox",
                error: {},
                flashMessage: {}
            });
        
    } catch (error) {
        next(error)
    }
};

/* exports.conversationByIdGetController = async (req, res, next) => {

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
            // console.log("all conversations inside: ", allConversations);
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
            conversationName,
            firstTimeGet: 0
        });
        
    } catch (error) {
        next(error);
    }
}; */

// search conversation
exports.searchConversation = async (req, res, next) => {

    const conversation = req.body.conversation;
    const searchQuery = user.replace("+88", "");
  
    const name_search_regex = new RegExp(escape(searchQuery), "i");
    const mobile_search_regex = new RegExp("^" + escape("+88" + searchQuery));
    const email_search_regex = new RegExp("^" + escape(searchQuery) + "$", "i");
  
    try {
      if (searchQuery !== "") {
        const users = await User.find(
          {
            $or: [
              {
                name: name_search_regex,
              },
              {
                mobile: mobile_search_regex,
              },
              {
                email: email_search_regex,
              },
            ],
          },
          "name avatar"
        );
  
        res.json(users);
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
    
  console.log("body.body: ", req.body.message);

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
        
        console.log("newMessage: ", newMessage);
        const result = await newMessage.save();
        console.log("created message: ", result);

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
  
// search user
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