exports.aboutUsGetController = (req, res, next) => {
    
    res.render("pages/aboutus.ejs",
        {
            title: "About Us",
            error: {},
            values: {},
            flashMessage : {}
        });
};