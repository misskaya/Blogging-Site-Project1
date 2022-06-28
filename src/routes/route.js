const express = require("express")
const router = express.Router();
const authorController = require("../controllers/authorController")
const blogsController = require("../controllers/blogsController")
const middleware = require("../middlewares/auth")


// create Author
// router.post("/authors",authorController.createAuthor)

// router.post('/blogs',blogsController.createBlog)

// router.get('/blogs',blogsController.getBlogs)
// router.put('/blogs/:blogsId',blogsController.updateBlog)
// router.delete('/blogs/:blogsId',blogsController.deletedByParams)
// router.delete('/blogs',blogsController.deletedByQuery)

// // // AUTHOR LOGIN
// router.post("/login",authorController.authorLogin)

router.post('/authors', authorController.createAuthor);

router.post('/blogs', middleware.authenticate, blogsController.createBlog);

router.get('/blogs', middleware.authenticate, blogsController.getBlogs);

router.put( '/blogs/:blogsId',middleware.authenticate,middleware.authorise, blogsController.updateBlog);

router.delete('/blogs/:blogsId',middleware.authenticate,middleware.authorise,blogsController.deletedByParams);

router.delete('/blogs', middleware.authenticate,blogsController.deletedByQuery);

router.post('/login', authorController.authorLogin);

module.exports = router;