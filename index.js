const path = require('path');
const express = require('express');
const flash = require("connect-flash");
const passport = require('./config/passport').passport;
const expressSessConf = require('./config/express-session');
const passportStrategy = require('./config/passport').localStrategy;
const indexCntlr = require('./controller/indexController');
const authRoute = require('./routes/auth');
const postsRoute = require('./routes/posts');

app = express();

// Middleware for views and body parsing
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));

// Middleware for authentication
app.use(expressSessConf)              // express-session
app.use(passport.session());          // passportjs
passport.use(passportStrategy);       // local strategy
app.use(flash());                     // transmitting alerts/messages
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Middleware for routes
app.use('/auth',authRoute)
app.use('/posts',postsRoute)


app.get("/", indexCntlr.getLimitedPosts);
app.use(indexCntlr.catchAll);
app.use(indexCntlr.errHandler);


app.listen(3000, ()=>{
    console.log('Express app started on port 3000')
})