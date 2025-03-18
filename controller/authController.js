const bcrypt = require("bcryptjs");
const passport = require('passport');
const dbController = require('./dbController');
const { validationResult } = require('express-validator');


function getRegisterUser(req, res) {
    if(req.isAuthenticated()){
        res.redirect('/');
    } else {
        res.render("auth/signUp", {
            title: "sign up"
        })
    };
}

async function postRegisterUser (req, res, next) {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).render("auth/signUp", {
        title: "Sign up",
        errors: errors.array(),
      });
    
    } else {
      
      try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await dbController.registerUser(req.body.username,req.body.email,hashedPassword);
        
        // Log the user in after registration
        req.login(user[0], (err) => {
          if (err) {
            return next(err);
          }
            return res.redirect('/');
        });
      
      } catch(err) {
        return next(err);
      }
    }
}


function getSignUserIn(req, res) {
    if(req.isAuthenticated()){
        res.redirect('/');
    } else {
        res.render("auth/signIn", {
        title: "sign in"
    })};
}

async function postSignUserIn (req, res, next) {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("auth/signIn", {
        title: "sign in",
        errors: errors.array(),
      });
    
    } else {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.render("auth/signIn", { 
            title: "sign in",
            errors: [ {msg: info.message} ]
        })};
        
        // Successful login
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.redirect("/");
        });
      })(req, res, next);
    }
}

function getSignUserOut(req, res, next) {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
}

function getAccount(req, res) {
  if (req.isAuthenticated()) {
    res.render('auth/account', {
        title: "update membership",
        alert: req.flash('alert'),
    })
  } else {
    res.status(401).redirect("/auth/signin");
  }
}

async function postAccount(req, res) {
  if (req.isAuthenticated()) {
    const update = req.user.member !== req.body.member;
    if (update) {
        await dbController.updateUserStatus(req.user.id,req.body.member);
        req.flash('alert',`User Role: ${req.body.member}`);
    } else {
        req.flash('alert',"No changes detected!");
    }
    res.redirect('/auth/account');
  } else {
    res.status(401).redirect("/auth/signin");
  }
}

async function postJoin(req, res) {
    if (req.isAuthenticated()) {
      const errors = validationResult(req);
    
      if (!errors.isEmpty()) {
        return res.status(400).render("auth/account", {
          title: "update membership",
          errors: errors.array(),
        });
      
      } else {
        const correct = req.body.answer.toLowerCase() === 'odin';
        if (correct) {
          await dbController.updateUserStatus(req.user.id,'basic');
          req.flash('alert','Welcome to the Club!');
        } else {
          req.flash('alert',"Uh Oh! Wrong Answer");
        }
        res.redirect('/auth/account');
      }
    } else {
      res.status(401).redirect("/auth/signin");
    }
}

module.exports = { 
    getRegisterUser,postRegisterUser,
    getSignUserIn,postSignUserIn,
    getSignUserOut,getAccount,
    postAccount,postJoin
}