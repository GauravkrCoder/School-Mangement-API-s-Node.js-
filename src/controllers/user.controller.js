var client = require("../config/postgresDB.config");
var passwordHash = require("password-hash");
var Joi = require("joi");
var nodemailer = require("nodemailer");
var jwt = require("jsonwebtoken");
const multer = require("multer");
var fs = require("fs");
var sentEmail = require("../shared/utils/sentMails");
var staticConstants = require("../shared/statics/appConstants");
var randomString = require("randomstring");

/* getting current date & time */
function getCurrentDateTime() {
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  return (
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds
  );
  // return date_ob
}

/* User Registration Controller API to process Request & Response */
signUp = (request, response, next) => {
  /* Validating the request */
  const registerSchema = Joi.object({
    email_id: Joi.string().email().required(),
    password: Joi.string().min(6).max(16).required(),
    user_role: Joi.string().required(),
  });
  const { error } = registerSchema.validate(request.body);
  if (error) {
    // response.send(error.details[0].message);
    response.status(400).json({
      code: 400,
      message: error.details[0].message,
    });
    response.end(data);
  } else {
    /* End Validating the request */
    /* If request is validated properly then going to store new user data to DB  */
    email_id = request.body.email_id;
    password = passwordHash.generate(request.body.password);
    user_role = request.body.user_role;
    created_at = getCurrentDateTime();
    updated_at = getCurrentDateTime();
    last_login = getCurrentDateTime();

    const text =
      "INSERT INTO _tblSuperSurveyUsers(email_id,password,user_role,created_at,updated_at,last_login) VALUES($1, $2,$3,$4,$5,$6)";
    const values = [
      email_id,
      password,
      user_role,
      created_at,
      updated_at,
      last_login,
    ];
    // callback
    client.query(text, values, (err, result) => {
      if (err) {
        if (err.detail) {
          console.log(err);
          response.status(409).json({
            code: 409,
            error: "Email already exists",
          });
        }
      } else {
        response.status(200).json({
          code: 200,
          message:
            "Registered Successfully..,Please Check your email inbox to verify.",
        });
        /* After Successfully register Send Verification mail to User (on Registered Email ID to get verified)*/
        const _mailContents = {
          toMail: email_id,
          subject: "Congratulations you have register successfully.",
          text: "Please verify your email",
          content: staticConstants.emailVerificationText,
        };
        sentEmail._sendEmail(_mailContents);
      }
    });
  }
};

/* Login Api Controller */
login = (request, response, next) => {
  const _loginData = Joi.object({
    email_id: Joi.string().email().required(),
    password: Joi.string().min(6).max(16).required(),
  });

  const { error } = _loginData.validate(request.body);
  if (error) {
    return next(error);
  } else {
    email_id = request.body.email_id;
    const query = `SELECT * FROM _tblSuperSurveyUsers WHERE email_id=$1`;
    const values = [email_id];
    client.query(query, values, (err, result) => {
      if (err) {
        if (err.detail) {
          console.log(err);
          response.json({
            error: "email_does_not_exists",
          });
        }
      } else {
        const decrpytPassword = result.rows[0]?.password;
        if (decrpytPassword === undefined) {
          response.json({
            error: "email_does_not_exists",
          });
        } else {
          if (passwordHash.verify(request.body.password, decrpytPassword)) {
            var token = jwt.sign(
              {
                user_id: result.rows[0].user_id,
                email_id: result.rows[0].email_id,
                created_at: result.rows[0].created_at,
                updated_at: result.rows[0].updated_at,
              },
              "shhhhh"
            );
            const _userData = {
              user_id: result.rows[0].user_id,
              email_id: result.rows[0].email_id,
              created_at: result.rows[0].created_at,
              updated_at: result.rows[0].updated_at,
              token: token,
            };
            response.status(200).json({
              code: 200,
              message: "login_success",
              data: _userData,
            });
          } else {
            response.status(401).json({
              code: 401,
              message: "email_or_password_wrong",
            });
          }
        }
      }
    });
  }
};

forgetPassword = (request, response, next) => {
  try {
    const _frgtPwdData = Joi.object({
      email_id: Joi.string().email().required(),
    });
    const { error } = _frgtPwdData.validate(request.body);
    if (error) {
      return next(error);
    } else {
      email_id = request.body.email_id;
      const query = `SELECT * FROM _tblSuperSurveyUsers WHERE email_id=$1`;
      const values = [email_id];
      client.query(query, values, (err, result) => {
        if (err) {
          if (err.detail) {
            console.log(err);
            response.json({
              error: "Email does not exists.",
            });
          }
        } else {
          const _isEmailIdExist = result.rows[0]?.email_id;
          if (_isEmailIdExist === undefined) {
            response.json({
              error: "Email does not exists.",
            });
          } else {
            response.status(200).json({
              code: 200,
              message: "Mail Sent,please check.!",
            });
            const _randomStringToken = randomString.generate();
            console.log(`${email_id}`);
            const values = [_randomStringToken, email_id];
            let query = `UPDATE _tblsupersurveyusers SET token=$1 WHERE email_id=$2`;
            client.query(query, values, (err, result) => {
              if (err) {
                console.log("Update Error -", err);
                throw err;
              } else {
                const _mailContents = {
                  toMail: email_id,
                  subject: "Reset Password.",
                  text: "To reset password, click on the link below.",
                  content: `<p> We heard that you lost your password. Sorry about that! </p>
                  <p>But don’t worry! You can use the following link to reset your password:</p>
                  <a href="http://localhost:4200/reset-password?token=${_randomStringToken}"> Reset Password </a> 
                  <p>Thanks </p>
                  <p>Team Super Survey</p>`,
                };
                sentEmail._sendEmail(_mailContents);
              }
            });
          }
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
};

/* Reset Password API */
resetPassword = (req, res, next) => {
  /* Get token first & Validate the token exist from DB */
  const _token = req.query.token;
  const _password = passwordHash.generate(req.body.password);
  const values = [_token];
  const query = `SELECT email_id FROM _tblSuperSurveyUsers WHERE token=$1`;
  client.query(query, values, (err, result) => {
    if (err) {
      throw err;
    } else {
      const _isEmailId = result.rows[0]?.email_id;
      console.log("Result", result.rows[0]?.email_id);
      if (_isEmailId === undefined) {
        res.json({
          error: "Invalid Token",
        });
      } else {
        console.log("Result", result.rows[0]?.email_id);
        const values = [_password, _isEmailId];
        const query = `UPDATE _tblsupersurveyusers SET password=$1 WHERE email_id=$2`;
        client.query(query, values, (err, result) => {
          if (err) {
            throw err;
          } else {
            res.status(200).json({
              code: 200,
              message: "Password updated successfully, Please login!",
            });
          }
        });
      }
    }
  });

  console.log(_token);
  console.log(_password);
};

/* Sample User List GET */
getUserList = (request, response, next) => {
  client.query("select * from _tblSuperSurveyUsers", (err, result) => {
    if (err) {
      console.log(err.stack);
    } else {
      response.status(200).json({
        code: 200,
        message: "Get User List Successfully.",
        data: result.rows,
      });
    }
  });
};

var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "src/assets/uploadedImages");
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now() + ".jpg");
    },
  }),
}).single("profilePic");

uploadProfilePicture = (request, response, next) => {
  // Error MiddleWare for multer file upload, so if any
  // error occurs, the image would not be uploaded!
  upload(request, response, function (err) {
    // console.log("Upload Req", request.file);
    filename = request.file.filename;
    filepath = request.file.path;
    mimetype = request.file.mimetype;
    size = request.file.size;
    user_id = request.body.user_id;

    if (err) {
      /*  ERROR occured (here it can be occured due to uploading image of size greater than      1MB or uploading different file type) */
      response.send(err);
    } else {
      const query = `insert into _tblUserImagefiles (filename,filepath,mimetype,size,user_id) values ($1,$2,$3,$4,$5)`;
      let values = [filename, filepath, mimetype, size, user_id];
      client.query(query, values, (err, result) => {
        if (err) {
          if (err.detail) {
            console.log(err);
            if (err.detail) {
              const updateQuery = `UPDATE _tblUserImagefiles 
                                 SET filename = $1, filepath = $2, mimetype = $3,size= $4
                                 WHERE user_id=$5`;
              client.query(updateQuery, values, (err, result) => {
                if (err) {
                  if (err.detail) {
                    response.status(409).json({
                      code: 409,
                      error: err.detail,
                    });
                  }
                } else {
                  response.status(200).json({
                    code: 200,
                    messgae: "Success, Image updated!",
                  });
                }
              });
            }
          }
        } else {
          response.status(200).json({
            code: 200,
            message: "Success, Image uploaded!",
          });
        }
      });
    }
  });
};

getProfilePic = (request, response, next) => {
  fs.readFile(
    "src/assets/uploadedImages/profilePic-1661960109314.jpg",
    function (err, data) {
      if (err) throw err; // Fail if the file can't be read.
      // response.writeHead(200, { "Content-Type": "image/jpeg" });
      // let imageAsBase64 = fs.readFileSync(data, 'base64');
      // response.end(imageAsBase64);
      // response.status(200).json({
      //   code: 200,
      //   image: "http://localhost:3000/" + data,
      // });
    }
  );
};

module.exports = {
  signUp,
  login,
  forgetPassword,
  resetPassword,
  uploadProfilePicture,
  getProfilePic,
  getUserList,
};
