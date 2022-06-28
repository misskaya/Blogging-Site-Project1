const authorModel = require("../models/authorModels")
const blogsModel = require("../models/blogsModel")
const jwt = require("jsonwebtoken")
 // create Author
const createAuthor = async function (req,res) {
  let data = req.body
  
  let savedData = await authorModel.create(data)
  res.send({msg: savedData})
}


const authorLogin = async function (req, res) {
  try{
  let email = req.body.emailId;
  if (!email)
  return res.status(400).send({ err: 'enter email' });
  // ({status: false, msg: 'enter email'});
  let password = req.body.password;
  if (!password)
  return res.status(400).send({ err: 'enter password' });

  let author = await authorModel.findOne({ email: email, password: password });
  if (!author)
    return res.status(404).send({ err: 'author not found' });
    // send({status: false, msg: 'author not found',
    // });
  let jwttoken = jwt.sign(
    {
      authorId: author._id.toString(),
      // batch: 'radon',
      // organisation: 'FunctionUp',
    },
    'functionup-radon'
  );
  res.setHeader('x-api-key', jwttoken);
  res.status(200).send({status: true, token: jwttoken});
//   send({ status: true, token: jwttoken });
}
catch (err) {
  res.status(500).send({ msg: 'Error', error: err.message });
}
}




module.exports.createAuthor = createAuthor;
module.exports.authorLogin = authorLogin;