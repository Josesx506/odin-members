### Summary
This has been one of the more advanced projects so far. Required repeated templating with ejs and custom 
functionality to handle alerts and error notifications throughout the app. Requirements
- [x] Create landing page that describes what the project is about
- [x] Develop authentication middleware with `passportJS` LocalStrategy and `bcryptjs` for onboarding users
- [x] Use user sessions to persist user authorization for protected routes
- [x] Develop simple role based access control using a db column that persists user roles
- [x] Modify UI depending on user role (create, view, & delete)
- [x] Sanitize form inputs with `express-validator` to minimize XSS attacks
- [x] Define catchall error handlers at the end of all routes to prevent the app from crashing
- [x] Redirect users to home page to avoid repeated sessions when logged in.

Install requirements with npm install and start the app in dev mode with `npm run dev` or prod 
`npm run start`. The app requires an active postgres db and a secret key
```bash
DBURI = postgresql://xxxx
SESS_SECRET = xxx
```

The app uses 3 tables for the (user sessions, users info, and posts info), and it is deployed to railway.

### Rendering errors as alerts
`connect-flash` library is used to transmit messages across routes. Each message requires a key and a value 
`req.flash(<key>,<value>)`, then the key can be referenced to extract the message in another route. It's 
useful for rendering alerts/error messages when `res.locals` cannot be accessed during redirects.
```JS
function getAdmin(req, res, next) {
    res.render('auth/admin', {
        title: "update membership",
        alert: req.flash('alert'),
    })
}
async function postAdmin (req, res, next) {
    await dbController.updateUserStatus(req.user.id,req.body.status);
    req.flash('alert',`User Role: ${req.body.status}`);
    res.redirect('/auth/admin');
}
```