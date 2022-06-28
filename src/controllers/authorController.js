const authorModel = require("../models/authorModels")           //  IMPORT AUTHOR MODEL
const blogsModel = require("../models/blogsModel")            // IMPORT BLOGS MODEL
const jwt = require("jsonwebtoken")

//  CREATE AUTHOR
const createAuthor = async (req, res) => {
  try {
    const data = req.body;
    const email = await authorModel.findOne({ email: data.email }); //email exist or not
    if (!data.email){
      return res.status(400).send({status:false,msg:"Email is missing"});
    }
   
    //EMAIL VALIDATION BY REGEX
    const validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

 if (!validateEmail(data.email)) {
  return res.status(400).send({status: false, msg: "Invaild E-mail Format." });
}
if (email) {
  return res.status(404).send({ status:false,msg: "Email already exist" });
 }

   
    if (!data.password) {
      return res.status(400).send({status:false,msg:"Password is missing"});
  }
    //STRING VALIDATION BY REGEX
    const validateName = (name) => {
     return String(name).match(
         /^[a-zA-Z]/);
    };

  //FIRST NAME VALIDATION BY REGEX
  if (!validateName(data.fname)) {
    return res.status(400).send({status: false,msg: "First name must contain Alphabet",});
  }
  if (!data.fname){
    return res.status(400).send({ status:false,msg:"First name is missing"});
   }
 //LAST NAME VALIDATION BY REGEX
 if (!validateName(data.lname)) {
  return res.status(400).send({status: false,msg: "Last name must contain Alphabet",});
}
if (!data.lname) {
  return res.status(400).send({status:false ,msg:"Last name is missing"});
}
if (!data.title) {
  return res.status(400).send({status:false ,msg:"Title is missing"});
}
if (data.title != ('Mr' || 'Mrs' || 'Miss'))
      return res.status(400).send({ status: false, msg: 'Enter valid title' });
        

    if (Object.keys(data).length == 0) {
      return res.status(400).send({status:false, msg: "Feild Can't Empty.Please Enter Some Details" });
    }
    const author = await authorModel.create(data);
     res.status(201).send({status:true,msg: author });
  }
    catch (err) {
      res.status(500).send({ status:false,error: err.message });
        }
      };
    
// AUTHOR LOGIN
const authorLogin = async function (req, res) {
  try{
  let email = req.body.email;
  if (!email)
  return res.status(400).send({ err: 'ENTER EMAILID' }); 
  let password = req.body.password;
  if (!password)
  return res.status(400).send({ err: 'ENTER PASSWORD' });

  let author = await authorModel.findOne({ email: email, password: password });
  if (!author)
    return res.status(404).send({ err: 'NO SUCH AUTHOR EXIST' });   // VALIDATION FOR AUTHOR
   
  let jwttoken = jwt.sign(
    {
      authorId: author._id.toString(),
      batch: 'radon',
      organisation: 'FunctionUp',
    },
    'radon-30'     // SECRET
  );
  res.setHeader('x-api-key', jwttoken);
  res.status(200).send({status: true, token: jwttoken});

}
catch (err) {
  res.status(500).send({ msg: 'Error', error: err.message });
}
}

module.exports.createAuthor = createAuthor;
module.exports.authorLogin = authorLogin;