const Institute = require("../models/Institute");

let title = "Add Institute";

exports.addInstituteGetController = (req, res, next) => {

    res.render("pages/institute/addInstitute",
        {
            title,
            error: {},
            value: {},
            flashMessage: Flash.getMessage(req),
        });
};
exports.addInstitutePostController = async(req, res, next) => {
    let { name } = req.body;
    try {
        let instituteObj = {
            name
        };

        let institute = new Institute(instituteObj);

        const createdInstitute = await institute.save();

        res.redirect("/institute/add");

    } catch (error) {
        next(error);
    }
};