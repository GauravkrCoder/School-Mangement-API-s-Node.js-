var client = require("../config/postgresDB.config");
var passwordHash = require("password-hash");
var Joi = require("joi");
var nodemailer = require("nodemailer");
var jwt = require("jsonwebtoken");

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
  });
  const { error } = registerSchema.validate(request.body);
  if (error) {
    // response.send(error.details[0].message);
    response.json({
      message: error.details[0].message,
    });
    response.end(data);
  } else {
    /* End Validating the request */
    /* If request is validated properly then going to store new user data to DB  */
    email_id = request.body.email_id;
    password = passwordHash.generate(request.body.password);
    created_at = getCurrentDateTime();
    updated_at = getCurrentDateTime();
    last_login = getCurrentDateTime();

    const text =
      "INSERT INTO _tblSuperSurveyUsers(email_id,password,created_at,updated_at,last_login) VALUES($1, $2,$3,$4,$5)";
    const values = [email_id, password, created_at, updated_at, last_login];
    // callback
    client.query(text, values, (err, result) => {
      if (err) {
        if (err.detail) {
          console.log(err);
          response.json({
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
        emailSent(email_id);
      }
    });
  }
};

/* Sending Verification Email */
async function emailSent(email) {
  /*Sending Verification email*/
  var transporter = nodemailer.createTransport({
    // service: 'gmail',
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "tristin.kuphal99@ethereal.email",
      pass: "44jJUbWhgd15hnEteY",
    },
  });

  var mailOptions = {
    from: "Super Survey",
    to: email,
    subject: "Congratulations you are now a member of our company",
    text: "Please Verify your email by clicking on the this button",
    html: `<a href="https://www.google.com" target="_blank" style="font: bold 11px Arial;
        text-decoration: none;
        background-color: #FFA500;
        color: #333333;
        padding: 2px 6px 2px 6px;
        border-top: 1px solid #CCCCCC;
        border-right: 1px solid #333333;
        border-bottom: 1px solid #333333;
        border-left: 1px solid #CCCCCC;">Verify</a> `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

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
            error: "Email does not exists.",
          });
        }
      } else {
        const decrpytPassword = result.rows[0]?.password;
        if (decrpytPassword === undefined) {
          response.json({
            error: "Email does not exists.",
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
              message: "Login success.!",
              data: _userData,
            });
          } else {
            response.status(401).json({
              code: 401,
              message: "Email or password is incorrect.",
            });
          }
        }
      }
    });
  }
};

module.exports = {
  signUp,
  login,
};
