const jwt = require('jsonwebtoken');

const blogsModel = require('../models/blogsModel');

// AUTHENTICATION

const authenticate = function (req, res, next) {
  try {
    let token = req.headers['x-api-key'];
    if (!token)
      return res.status(400).send({ status: false, msg: 'TOKEN MUST BE PRESENT' });
    let decodedToken = jwt.verify(token, 'radon-30');
    if (!decodedToken)
      return res.status(401).send({ status: false, msg: 'TOKEN  IS NOT VALID' });
    next();
  } catch (err) {
    res.status(500).send({ Status: 'SERVER ERROR', Msg: err.message });
  }
};

// AUTHORIZATION

const authorise = async function (req, res, next) {
  try {
    token = req.headers['x-api-key'];
    let blogsId = req.params.blogsId;
    let decodedToken = jwt.verify(token, 'radon-30');
    let authorId = decodedToken.authorId;
    let findBlog = await blogsModel.findOne({ authorId: authorId, _id: blogsId });
    if (!findBlog)
      return res.status(403).send({status: false, msg: 'YOU ARE NOT AUTHORIZED',
      });
    next();
  } catch (err) {
    res.status(500).send({ Status: 'SERVER ERROR', Msg: err.message });
  }
};

module.exports.authenticate = authenticate;
module.exports.authorise = authorise;