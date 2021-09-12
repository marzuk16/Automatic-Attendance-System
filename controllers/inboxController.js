const Profile = require("../models/Profile");
const Course = require("../models/Course");
const Conversation = require("../models/Conversation");

const escape = require("../utils/escape");

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
            // global.io.emit("update_conversation", res.locals.conversationList);
                
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

      //identify user is authorize or not
      const course = await Course.findOne({
          $and: [
            { _id: req.params.conversation_id },
            {
              $or: [
                { author: req.user._id },
                { joinedStudent: { "$in": [req.user._id] } }
              ]
            }
          ]
      });

      if( !course ){

        return res.status(401).json({
          errors: {
            common: {
              msg: "You are unauthorized user for this conversation!",
            },
          },
        });
      }

      const messages = await Conversation.find({
        course: req.params.conversation_id,
      }).sort("-createdAt");
  
      /* const { author, joinedStudent } = await Course.findById(
        req.params.conversation_id
      ); */
      const { author, joinedStudent } = course;
  
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

          //identify user is authorize or not
          const course = await Course.findOne({
            $and: [
              { _id: req.body.conversationId },
              {
                $or: [
                  { author: req.user._id },
                  { joinedStudent: { "$in": [req.user._id] } }
                ]
              }
            ]
        });

        // console.log("course: ", course);
        if( !course ){

          return res.status(401).json({
            errors: {
              common: {
                msg: "You are unauthorized user for this conversation!",
              },
            },
          });
        }

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

  const logedUser = req.user._id;
  const searchQuery = req.body.conversation;

  const search_regex = new RegExp("^" + escape(searchQuery), "i");
  
  try {

    if (searchQuery !== "") {

      const conversations = await Course.find(
        {
          $or: [
            {
              title: search_regex,
            },
            {
              batch: search_regex,
            },
            {
              term: search_regex,
            },
          ],
        }
      );
      
      console.log("conversations: ", conversations);
      let conversationList = [];
      conversations.forEach( item => {
        
        item.joinedStudent.push(item.author);
        if(item.joinedStudent.includes(logedUser))
          conversationList.push(item);
      });
      
      res.json(conversationList);

    } else {
      
      let courses = await Profile.findOne({user: req.user._id})
                                        .populate('course')
                                        .populate('joinedClass')
                                        .select({course: 1, _id: 0});
            
            // own created courses and joined courses
            let conversationList = [...courses?.course, ...courses?.joinedClass];

            res.json(conversationList);

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