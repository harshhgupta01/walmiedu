// Packages
const express = require("express");
const bodyParser = require("body-parser");
// const fileUpload = require('express-fileupload');
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const https = require("https");
const fs = require("fs");

//Sequelize
const sequelize = require("./util/database.js");

//Express obj
const app = express();

//Templating Engine
app.set("view engine", "ejs");
app.set("views", "views");

//Router obj
const { getMaxListeners } = require("process");

app.use(cors());
/*
    ### Middlewares
*/
//body parsing middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(express.json());
app.use(
  fileUpload({
    preserveExtension: true,
  })
);

// Routing
const adminRoutes = require("./controllers/admin");
app.use("/admin", adminRoutes);
const headRoutes = require("./controllers/head");
app.use("/head", headRoutes);
const teacherRoutes = require("./controllers/teacher");
app.use("/teacher", teacherRoutes);
const studentRoutes = require("./controllers/student");
app.use("/student", studentRoutes);
app.use("/form", express.static(__dirname + "/views/index.html"));

const login = require("./models/login.js");

app.get("/session", async (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    const bearertoken = req.headers.authorization.split(" ")[1];
    login
      .findOne({
        where: {
          bearertoken,
        },
      })
      .then((user) => {
        res.json(user.category);
      });
  }
});

// const httpsServer = https.createServer(
//   {
//     key: fs.readFileSync(
//       "/etc/letsencrypt/live/v12.milindsharma.com/privkey.pem"
//     ),
//     cert: fs.readFileSync(
//       "/etc/letsencrypt/live/v12.milindsharma.com/fullchain.pem"
//     ),
//   },
//   app
// );

//Creating Database and Starting the server
sequelize
  .sync()
  .then((result) => {
    app.listen(3000);
    // httpsServer.listen(3000, (err) => {
    //   if (err) {
    //     console.log(err);
    //     throw err;
    //   } else {
    //     console.log("HTTPS Server running on port 3000");
    //   }
    // });
  })
  .catch((err) => {
    console.log(err);
  });
