const dbController = require('./dbController');

function formatDateTime(date) {
    return date.toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
        hour12: false
    }).replace(",", " ·");
}

async function getLimitedPosts(req, res) {
    const posts = await dbController.getDBPostsLimit(3);
    res.render('index', {
        title: 'Home Page',
        posts: posts,
        dtFmtr: formatDateTime
    })
}

function catchAll(req, res, next) {
    const err = new Error("Page not found");
    err.status = 404;
    next(err);
}

function errHandler(err, req, res, next) {
    res.status(err.status || 500).render('404', {
        title: 'error page',
        id : err.status || "not_found", 
        error: err.message 
    });
}

module.exports = { getLimitedPosts, catchAll, errHandler }