const mongoose = require('mongoose')
const blogsModel = require("../models/blogsModel")
const authorModel = require("../models/authorModels");
const { validate } = require('../models/blogsModel');
// const ObjectId = mongoose.Types.ObjectId



const createBlog = async function (req, res) {
  try {
    let data = req.body;   
    //  VALIDATE ALL MANDATORY SECTION IN BLOGS MODEL
    if (!data.authorId)
      return res.status(400).send({ status: false, msg: 'enter author id' });
    let check = await authorModel.findById(data.authorId);
    if (!check)
      return res.status(400).send({ status: false, msg: 'enter valid author id' });
    const createdBlog = await blogsModel.create(data);
    if (!createdBlog)
      return res.status(400).send({ status: false, msg: 'data required' });
    res.status(201).send({ status: true, msg: createdBlog });
  } catch (err) {
    res.status(500).send({ status: false,msg: err.message,
    });
  }
};




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
      return res.status(404).send({ msg: 'blogs not found' });
    }
    res.status(200).send(allBlogs);
  } catch (err) {
    res.status(500).send({ msg: 'Error', error: err.message });
  }
};

const updateBlog = async function (req, res) {
  try {
    let body = req.body;
    let id = req.params.blogsId;
    let user = await blogsModel.findById({ _id: id });
    if (!user) {
      return res.status(404).send('No such Blog found');
    }
    if (user.isDeleted == true) {
      return res.status(404).send({ err: 'Blogs not found' });
    }
    let data = await blogsModel.findByIdAndUpdate({ _id: id }, body, {$set: {
      isPublished: true,
      publishedAt: Date(),
      },
      new: true,
    });
    res.status(200).send({ msg: data });
  } catch (err) {
    res.status(500).send({ msg: 'Error', error: err.message });
  }
};

const deletedByParams = async function (req, res) {
  try {
    let id = req.params.blogsId;
    const allBlogs = await blogsModel.findOne({ _id: id, isDeleted: false });
    if (!allBlogs) {
      return res.status(404).send({ status: false, Msg: 'This blog is deleted.' });
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

const deletedByQuery = async function (req, res) {
  try {
    let data = req.query;
    if (!data.authorId)
      return res.status(400).send({ status: false, msg: 'author id required' });
    //let queryData = {};
    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: 'no query params' });
    }
    //queryData = data;
    const check = await blogsModel.find(data).count();
    if (check == 0)
      return res.status(404).send({ status: false, msg: 'data not found' });
    const deletedData = await blogsModel.updateMany(data, {
      $set: {
        isDeleted: true,
        deletedAt: Date(),
      },
    });
    res.status(200).send({status: true, data: deletedData,
    });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message,
    });
  }
};




module.exports.createBlog = createBlog;
module.exports.getBlogs = getBlogs;
module.exports.deletedByQuery = deletedByQuery;
module.exports.updateBlog = updateBlog;
module.exports.deletedByParams = deletedByParams;