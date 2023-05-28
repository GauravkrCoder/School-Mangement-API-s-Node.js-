var express = require("express");
var app = express();
require("dotenv").config();
var client = require("./config/postgresDB.config");
// var mysqlClient = require("./config/mySqlDB.config");

app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With"
  );
  res.header("Access-Control-Allow-Methods", "*");
  return next();
});

/* importing different routes */
var userRoute = require("./routes/userRoute");

app.use("/api/user", userRoute.router);



// app.get("/", (request, response) => {  
//   mysqlClient.query("select * from tbluser", (err, result) => {
//     if (err) {
//       console.log(err.stack);
//     } else { 
//       console.log(result);     
//       response.status(200).json({
//         code: 200,
//         message: "Get User List Successfully.",
//         data: result,
//       });     
//     }
//   });
// });

/* Setting the PORT NUMBER */
const PORT = process.env.PORT || 3000;


/* To Start server run nodemon src/server.js */
app.listen(PORT, (err) => {
  // if (err) throw err;
  if (err) {
    console.log(err);
  }else{
    console.log(`Server is running on port http://localhost:${PORT}`);

  }
});
