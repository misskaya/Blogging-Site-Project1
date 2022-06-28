const jwt = require('jsonwebtoken');

const blogsModel = require('../models/blogsModel');

// AUTHENTICATION
const authenticate = function (req, res, next) {
  try {
    let token = req.headers['x-api-key'];
    if (!token)
      return res.status(400).send({ status: false, msg: 'token must be present' });
    let decodedToken = jwt.verify(token, 'radon-30');
    if (!decodedToken)
      return res.status(401).send({ status: false, msg: 'token is not valid' });
    next();
  } catch (err) {
    res.status(500).send({ Status: 'SERVER ERROR', Msg: err.message });
  }
};

// AUTHORATION
const authorise = async function (req, res, next) {
  try {
    token = req.headers['x-api-key'];
    let blogsId = req.params.blogsId;
    let decodedToken = jwt.verify(token, 'radon-30');
    let authorId = decodedToken.authorId;
    let findBlog = await blogsModel.findOne({ authorId: authorId, _Id: blogsId });
    if (!findBlog)
      return res.status(403).send({status: false, msg: 'Unauthorized User',
      });
    next();
  } catch (err) {
    res.status(500).send({ Status: 'SERVER ERROR', Msg: err.message });
  }
};

module.exports.authenticate = authenticate;
module.exports.authorise = authorise;