const router = require('express').Router();
const validate = require('../config/validator');
const postCntlr = require('../controller/postController');

// Middleware to add the baseUrl to response.locals
router.use((req,res,next)=>{
  res.locals.baseUrl = req.baseUrl;
  next();
})

// Routes
router.get("/", postCntlr.getPosts);
router.post("/add", validate.validatePosts,  postCntlr.postNewBlog);
router.get("/delete", postCntlr.getDeleteBlog);

module.exports = router;