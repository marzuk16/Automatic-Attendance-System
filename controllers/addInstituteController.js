const Institute = require("../models/Institute");

let title = "Add Institute";

exports.addInstituteGetController = (req, res, next) => {
    console.log("add get");
    res.render("pages/institute/addInstitute",
        {
            title,
            error: {},
            value: {},
            flashMessage: {}
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

        req.flash("success", "Institute added !");
        res.redirect("/institute/add");

    } catch (error) {
        //console.log(error);
        next(error);
    }
};