exports.indexGetController = (req, res, next) => {
    
    res.render("pages/explorer/explorer",
        {
            title: "Home",
            error: {},
            values: {},
            flashMessage: {}
        });
};