const ContactUs = require("../models/ContactUs");

const { validationResult } = require("express-validator");
const Flash = require("../utils/Flash");

const errorFormatter = require("../utils/validationErrorFormatter");

exports.contactUsGetController = (req, res, next) => {
    
    res.render("pages/contactus.ejs",
        {
            title: "Contact Us",
            error: {},
            values: {},
            flashMessage : Flash.getMessage(req)
        });
};
exports.contactUsPostController = async (req, res, next) => {
    const { name, email, message } = req.body;
    // console.log(req.body);

    let errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {

        return res.render("pages/contactus.ejs",
        {
            title: "Contact Us",
            error: errors.mapped(),
            values: {
                name,
                email,
                message
            },
            flashMessage: {}
        });
    }
    try {
        
        let contactObj = {
            name,
            email,
            message
        };

        let contactUs = new ContactUs(contactObj);

        const createdContactUs = await contactUs.save();
        console.log("createdUser: ", createdContactUs);


        req.flash("success", "Thanks for contact us!")
        res.redirect("/contact-us");

    } catch (error) {
        next(error);
    }
};