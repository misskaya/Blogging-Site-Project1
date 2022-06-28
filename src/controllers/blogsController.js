const blogsModel = require("../models/blogsModel");
const authorModel = require("../models/authorModels");
const jwt = require("jsonwebtoken");
const date = new Date();

const createBlog = async function (req, res) {
  try {
    let data = req.body;
       //  TITLE FORMAT CHECK BY REGEX
      const validatefield = (Feild) => {
           return String(Feild)
               .match(
                   /^[a-zA-Z]/
               );
       };
       if (!validatefield(data.title)) {
        return res.status(400).send({ status: false, msg: "Invaild title Format Please try again with valid Format" })//title validation By Rejex
    }
       
     let token = req.headers["x-api-key"] || req.headers["x-Api-Key"];
      if (Object.keys(data).length == 0) {
          return res.status(400).send({status:false, msg: "data required for creating blog" })//details is given or not
      }
      if (!data.title) {
          return res.status(400).send({status:false,msg: "Title not given" })
      }
     
      if (!data.body) {
       return res.status(400).send({status:false,msg: "please fill the body section" })
      }
      if (!validatefield(data.body)) {
       return res.status(400).send({ status: false, msg: "Invaild body Format PLEASE TRY AGAIN WITH VALID FORMAT" })
      }
    //  VALIDATE ALL MANDATORY SECTION IN BLOGS MODEL
    if (!data.authorId)
      return res.status(400).send({ status: false, msg: 'ENTER VALID AUTHORID' });

    let check = await authorModel.findById(data.authorId);
    if (!check)
     return res.status(400).send({ status: false, msg: 'ENTER VALID AUTHOR ID' });

     let decodedtoken = jwt.verify(token, "radon-30");
     if (decodedtoken.authorId!=req.body.authorId)  {
         return res.status(401).send({ status: false, msg: "You are Not Authorized To create This Blog With This Author Id" });
        }
      const blog = await blogsModel.create(data)
      res.status(201).send({ status:true,msg: blog })
  }
 catch (err) {
      res.status(500).send({status:false, error: err.message })
  }
};

// GETBLOGS
const getBlogs = async function (req, res) {
  try {
    let data = req.query;
    let filter = { isDeleted: false, isPublished: true };
    if (Object.keys(data).length > 0) {
      if (data.tags) {
        data.tags = { $in: data.tags.split(',') };
      }
      if (data.subcategory) {
        data.subcategory = { $in: data.subcategory.split(',') };
      }
      filter['$or'] = [
        { authorId: data.authorId },
        { category: data.category },
        { subcategory: data.subcategory },
        { tags: data.tags },
      ];
    }
    let allBlogs = await blogsModel.find(filter);
    if (allBlogs.length == 0) {
      return res.status(404).send({ msg: 'BLOGS NOT FOUND' });
    }
    res.status(200).send({status:true, allBlogs});
  } catch (err) {
    res.status(500).send({ msg: 'Error', error: err.message });
  }
};


// UPDATEBLOG
const updateBlog = async function (req, res) {
  try {
    let id = req.params.blogsId;

    let data = req.body;

    let blog = await blogsModel.findOne({ _id: id, isDeleted: false });

    if (Object.keys(blog).length == 0) {
      return res.status(404).send('No such blog found');
    }

    if (data.title) blog.title = data.title;

    if (data.category) blog.category = data.category;

    if (data.body) blog.body = data.body;

    if (data.tags) {
      blog.tags.push(data.tags);
    }

    if (data.subcategory) {
      blog.subcategory.push(data.subcategory);
    }

    blog.isPublished = true;

    blog.publishedAt = Date();

    let updateData = await blogsModel.findByIdAndUpdate({ _id: id }, blog, {
      new: true,
    });

    res.status(200).send({ status: true, msg: updateData });
  } catch (err) {
    res.status(500).send({ msg: 'Error', error: err.message });
  }
};

// DELETEDBYPARAMS
const deletedByParams = async function (req, res) {
  try {
    let id = req.params.blogsId;
    const allBlogs = await blogsModel.findOne({ _id: id, isDeleted: false });
    if (!allBlogs) {
      return res.status(404).send({ status: false, Msg: 'THIS BLOG IS DELETED.' });
    }
    allBlogs.isDeleted = true;
    const updated = await blogsModel.findByIdAndUpdate({ _id: id }, allBlogs, {
      new: true,
    });
    res.status(200).send({ status: true, Msg: updated });
  } catch (err) {
    res.status(500).send({ Status: 'SERVER ERROR', Msg: err.message });
  }
};

// DELETEDBYQUERY
const deletedByQuery = async function (req, res) {
  try {
    let data = req.query;
     if (Object.keys(data).length == 0)
      return res.status(400).send({ status: false, msg: 'no query params' });

    if (!data.authorId)
      return res.status(400).send({ status: false, msg: 'AUTHOR ID REQUIRED' });

    let token = req.headers['x-api-key'];
    let decodedToken = jwt.verify(token, 'radon-30');
    if (decodedToken.authorId != data.authorId)
      return res.status(403).send({ status: false, msg: 'YOU ARE NOT AUTHORIZED' });

    let queryData = { isDeleted: false };

    if (data.tags) {
      data.tags = { $in: data.tags.split(',') };
    }

    if (data.subcategory) {
      data.subcategory = { $in: data.subcategory.split(',') };
    }

    queryData['$or'] = [
      { authorId: data.authorId },
      { category: data.category },
      { subcategory: data.subcategory },
      { tags: data.tags },
      { isPublished: data.isPublished },
    ];

    const check = await blogsModel.find(queryData).count();
    if (check == 0)
      return res.status(404).send({ status: false, msg: 'DATA NOT FOUND' });

    const deletedData = await blogsModel.updateMany(queryData, {
      $set: {
        isDeleted: true,
        deletedAt: Date(),
      },
    });

    res.status(200).send({status: true,data: 'SUCCESSFULLY DELETED',
    });
  } catch (err) {
    res.status(500).send({status: false,msg: err.message,
    });
  }
};


module.exports.createBlog = createBlog;
module.exports.getBlogs = getBlogs;
module.exports.updateBlog = updateBlog;
module.exports.deletedByQuery = deletedByQuery;
module.exports.deletedByParams = deletedByParams;

