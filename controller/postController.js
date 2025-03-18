const dbController = require('./dbController');
const { validationResult } = require('express-validator');

function formatDateTime(date) {
    return date.toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
        hour12: false
    }).replace(",", " ·");
}

async function getPosts(req, res) {
    const posts = await dbController.getDBPosts();
    res.render('posts', {
        title: 'member posts',
        posts: posts,
        dtFmtr: formatDateTime,
        alert: req.flash('alert')
    })
}

async function postNewBlog(req, res) {
    if (req.isAuthenticated()) {
        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
          const posts = await dbController.getDBPosts();
          return res.status(400).render("posts", {
            title: "member posts",
            posts: posts,
            dtFmtr: formatDateTime,
            errors: errors.array(),
          });
        
        } else {
            const user_id = req.user.id;
            const title = req.body.title;
            const body = req.body.content;
            await dbController.createPost(user_id,title,body);
            req.flash('alert',"Post created successfully");
            res.redirect('/posts');
        }
    } else {
        res.status(401).redirect("/auth/signin");
    }
}

async function getDeleteBlog(req, res) {
    if (req.isAuthenticated()) {
        const postId = req.query.pid;
        if (req.isAuthenticated()) {
            await dbController.deletePost(postId);
            req.flash('alert',"Post deleted successfully");
            res.redirect('/posts');
        } else {
            req.flash('alert',"You wan delete wetin you no write?");
            res.redirect('/posts');
        }
    } else {
        res.status(401).redirect("/auth/signin");
    }
}

module.exports = { getPosts, postNewBlog, getDeleteBlog }