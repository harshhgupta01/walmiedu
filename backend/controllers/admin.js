const express = require("express");
const router = express.Router();
const { Admin } = require("../models/admin.js");
const { login } = require("../models/login");
const { School } = require("../models/school");
const { Class } = require("../models/class");
const { Lecture } = require("../models/lecture");
const nodemailer = require("nodemailer");
const { Student } = require("../models/student");
const { Subject } = require("../models/subject");
const { Teacher } = require("../models/teacher");
const sequelize = require("../util/database.js");
const { OTP } = require("../models/otp.js");

// Relations
School.hasMany(Class, {
  foreignKey: "school_id",
});
Class.belongsTo(School, {
  foreignKey: "school_id",
});
School.hasMany(Student, {
  foreignKey: "school_id",
});
Student.belongsTo(School, {
  foreignKey: "school_id",
});
Class.hasMany(Subject, {
  foreignKey: "class_id",
});
Subject.belongsTo(Class, {
  foreignKey: "class_id",
});
Teacher.hasMany(Subject, {
  foreignKey: "teacher_id",
});
Subject.belongsTo(Teacher, {
  foreignKey: "teacher_id",
});
Teacher.hasMany(Lecture, {
  foreignKey: "teacher_id",
});
Lecture.belongsTo(Teacher, {
  foreignKey: "teacher_id",
});
Subject.hasMany(Lecture, {
  foreignKey: "subject_id",
});
Lecture.belongsTo(Subject, {
  foreignKey: "subject_id",
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "celebalmailtest@gmail.com",
    pass: "Testing@12345?",
  },
});

// Login

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  Admin.findOne({
    where: {
      email: email,
    },
  })
    .then((user) => {
      if (!user) {
        res.json({
          error: "User not found",
        });
      } else {
        if (password === user.password) {
          const bearertoken = Math.floor(Math.random() * 10000001);
          login
            .create({
              secretkey: user.id,
              bearertoken: bearertoken,
              category: "admin",
            })
            .then((login) => {
              res.json({
                bearertoken,
              });
            })
            .catch((err) => {
              res.json({
                error: err.message,
              });
              console.log(err);
            });
        } else {
          res.json({
            error: "Invalid Password",
          });
        }
      }
    })
    .catch((error) => {
      res.json({
        error: error.message,
      });
    });
});

router.post("/logout", verifyToken, async (req, res) => {
  const token = req.token;
  login
    .destroy({
      where: {
        bearertoken: token,
      },
    })
    .then((result) => {
      console.log(result);
      res.json({
        message: "successfully logged out",
      });
    })
    .catch((err) => {
      console.log(err);
      res.json(err.message);
    });
});

router.post("/forgotPassword", async (req, res) => {
  const email = req.body.email;
  const token = randomName(25);
  const otp = Math.floor(Math.random() * 100000001);
  Admin.findOne({
    where: {
      email,
    },
  })
    .then((result) => {
      if (result) {
        const mailOptions = {
          to: email,
          from: "celebalmailtest@gmail.com",
          subject: "Reset your password",
          html: `<strong>${otp}</strong>`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);

            OTP.create({
              email,
              otp,
              token,
            })
              .then((record) => {
                res.json({
                  token,
                });
              })
              .catch((error) => {
                res.json(error.message);
                console.log(error);
              });
          }
        });
      } else {
        res.json({
          error: "Please enter a registered email id",
        });
      }
    })
    .catch((err) => {
      res.json(err.message);
      console.log(err);
    });
});

router.post("/resetPassword", async (req, res) => {
  const otp = req.body.otp;
  const token = req.body.token;
  OTP.findOne({
    where: {
      token,
    },
  })
    .then((result) => {
      let attempts = result.attempts;
      if (attempts > 2) {
        res.json({
          error: "Too many attempts",
        });
      } else {
        OTP.findOne({
          where: {
            token,
            otp,
          },
        })
          .then((user) => {
            if (user) {
              OTP.update(
                {
                  flag: 1,
                },
                {
                  where: {
                    token,
                    otp,
                  },
                }
              )
                .then((user2) => {
                  res.json({
                    message: "OTP verified successfully",
                  });
                })
                .catch((err) => {
                  res.json({
                    error: err.message,
                  });
                });
            } else {
              attempts += 1;
              OTP.update(
                {
                  attempts,
                },
                {
                  where: {
                    token,
                  },
                }
              )
                .then((user2) => {
                  res.json({
                    error: "Invalid OTP",
                  });
                })
                .catch((err) => {
                  res.json({
                    error: err.message,
                  });
                });
            }
          })
          .catch((error) => {
            res.json({
              error: error.message,
            });
          });
      }
    })
    .catch((error2) => {
      res.json({
        error: error2.message,
      });
    });
});

router.post("/newPassword", async (req, res) => {
  const new_password = req.body.password;
  const confirm_password = req.body.confirmpassword;
  const token = req.body.token;
  if (!new_password || !confirm_password || !token) {
    res.json({
      error: "We could not recieve the correct details",
    });
  } else {
    if (new_password == confirm_password) {
      OTP.findOne({
        where: {
          token,
        },
      })
        .then((result) => {
          if (result.flag == 1) {
            const email = result.email;
            Admin.update(
              {
                password: new_password,
              },
              {
                where: {
                  email,
                },
              }
            )
              .then((user) => {
                OTP.destroy({
                  where: {
                    token,
                  },
                })
                  .then((user2) => {
                    res.json({
                      message: "Password successfully updated",
                    });
                  })
                  .catch((err1) => {
                    res.json({
                      error: err1.message,
                    });
                    console.log(err1);
                  });
              })
              .catch((err) => {
                res.json({
                  error: err.message,
                });
              });
          } else {
            res.json({
              error: "OTP not verified",
            });
          }
        })
        .catch((error) => {
          res.json({
            error: error.message,
          });
        });
    } else {
      res.json({
        error: "Please enter same password in both the fields",
      });
    }
  }
});

// New Admin

router.post("/newAdmin", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  Admin.create({
    email: email,
    password: password,
  })
    .then((result) => {
      console.log(result);
      res.json({
        message: "successfull",
      });
    })
    .catch((err) => {
      res.json(err.message);
      console.log(err);
    });
});

router.get("/allAdmins", verifyToken, async (req, res) => {
  Admin.findAll()
    .then((admin) => {
      res.json(admin);
    })
    .catch((err) => {
      console.log(err);
    });
});

// School => (ADD, VIEW)

router.post("/addSchool", verifyToken, async (req, res) => {
  const school_name = req.body.school_name;
  const school_address = req.body.school_address;
  const head = req.body.head;
  const head_email = req.body.head_email;
  const head_password = req.body.head_password;

  School.findOne({
    where: {
      school_name,
    },
  }).then((result) => {
    if (!result) {
      School.create({
        school_name,
        school_address,
        head,
        head_email,
        head_password,
      })
        .then((result) => {
          console.log(result);
          // res.redirect('/admin/vacancy');
          res.json({
            message: "successfull",
          });
        })
        .catch((err) => {
          res.json(err.message);
          console.log(err);
        });
    } else {
      res.json({
        error: "A school with same name exists.",
      });
    }
  });
});

router.post("/updateSchool", verifyToken, async (req, res) => {
  const school_id = req.body.school_id;
  const school_name = req.body.school_name;
  const school_address = req.body.school_address;
  const head = req.body.head;
  const head_email = req.body.head_email;
  School.findOne({
    where: {
      school_id,
    },
  })
    .then((result) => {
      if (result) {
        School.update(
          {
            school_name,
            school_address,
            head,
            head_email,
          },
          {
            where: {
              school_id,
            },
          }
        )
          .then((result1) => {
            res.json({
              message: "School details successfully update",
            });
          })
          .catch((err) => {
            res.json(err.message);
            console.log(err);
          });
      } else {
        res.json({
          error: "Cannot find such school",
        });
      }
    })
    .catch((error) => {
      res.json(error.message);
      console.log(err);
    });
});

router.post("/headPassword", verifyToken, async (req, res) => {
  const school_id = req.body.school_id;
  const head_password = req.body.head_password;
  School.update(
    {
      head_password,
    },
    {
      where: {
        school_id,
      },
    }
  ).then((result) => {
    res.json({
      message: "Password successfully updated",
    });
  });
});

router.get("/viewSchools", verifyToken, async (req, res) => {
  School.findAll({
    order: [["school_name", "ASC"]],
  })
    .then((result) => {
      res.json(result);
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
      res.json(err.message);
    });
});

router.get("/schoolStudents/:school_id", verifyToken, async (req, res) => {
  const school_id = req.params.school_id;
  Student.count({
    where: {
      school_id,
    },
  })
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.json({
          error: "No students are added to this school yet.",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({
        error: err.message,
      });
    });
});

router.get("/viewSchools/:school_id", verifyToken, async (req, res) => {
  const school_id = req.params.school_id;
  School.findOne({
    where: {
      school_id,
    },
  })
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.json({
          error: "No schools are found",
        });
      }
    })
    .catch((err) => {
      res.json(err.message);
    });
});

// Classes => (VIEW)

router.get("/viewClasses/:school_id", verifyToken, async (req, res) => {
  const school_id = req.params.school_id;
  Class.findAll({
    where: {
      school_id,
    },
  })
    .then((result) => {
      if (result.length != 0) {
        res.json(result);
        //console.log(result);
      } else {
        res.json({
          error: "no classes are added yet.",
        });
      }
    })
    .catch((err) => {
      res.json(err.message);
      console.log(err);
    });
});

router.get("/viewClass/:class_id", verifyToken, async (req, res) => {
  const class_id = req.params.class_id;
  Class.findOne({
    include: [
      {
        model: School,
        required: true,
        attributes: ["school_name"],
      },
    ],
    where: {
      class_id,
    },
  })
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.json({
          error: "No such class exists",
        });
      }
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
      console.log(err);
    });
});

router.get("/viewStudents/:class_id", verifyToken, async (req, res) => {
  const class_id = req.params.class_id;
  Student.findAll({
    where: {
      class_id,
    },
  })
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.json({
          error: "No students are added to this class",
        });
      }
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
      console.log(err);
    });
});

router.get("/classStudents/:class_id", verifyToken, async (req, res) => {
  const class_id = req.params.class_id;
  Student.count({
    where: {
      class_id,
    },
  })
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.json({
          error: "No students are added to the class",
        });
      }
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
    });
});

router.get("/viewClassSubjects/:class_id", verifyToken, async (req, res) => {
  const class_id = req.params.class_id;
  Subject.findAll({
    include: [
      {
        model: Teacher,
        required: true,
        attributes: ["teacher_email", "teacher_name"],
      },
    ],
    where: {
      class_id,
    },
  })
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.json({
          error: "No subjects are added to this class",
        });
      }
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
    });
});

router.post("/addLecture", verifyToken, async (req, res) => {
  const lecture_path = req.body.lecture_path;
  const lecture_topic = req.body.lecture_topic;
  const lecture_description = req.body.lecture_description;
  const id = req.body.subject_id;
  Subject.findOne({
    where: {
      id,
    },
  }).then((result) => {
    const teacher_id = result.teacher_id;
    const class_id = result.class_id;
    Lecture.create({
      class_id,
      teacher_id,
      subject_id: id,
      lecture_path,
      lecture_topic,
      lecture_description,
    })
      .then((lecture) => {
        res.json({
          message: "Lecture successfully added",
        });
      })
      .catch((err) => {
        res.json({
          error: err.message,
        });
        console.log(err);
      });
  });
});

router.get("/viewLectures/:subject_id", verifyToken, async (req, res) => {
  const subject_id = req.params.subject_id;
  Subject.findOne({
    where: {
      id: subject_id,
    },
  })
    .then((user) => {
      if (user) {
        const teacher_id = user.teacher_id;
        Lecture.findAll({
          where: {
            subject_id,
            teacher_id,
          },
        })
          .then((result) => {
            if (result) {
              res.json(result);
            } else {
              res.json({
                error: "No lectures are added to this subject yet.",
              });
            }
          })
          .catch((err) => {
            res.json({
              error: err.message,
            });
            console.log(err);
          });
      } else {
        res.json({
          error: "No such subjects were found",
        });
      }
    })
    .catch((error) => {
      res.json({
        error: error.message,
      });
    });
});

router.post("/deleteLecture", verifyToken, async (req, res) => {
  const id = req.body.lecture_id;
  Lecture.destroy({
    where: {
      id,
    },
  })
    .then((result) => {
      res.json({
        message: "Lecture Deleted Successfully",
      });
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
      console.log(err);
    });
});

router.post("/updateLecture", verifyToken, async (req, res) => {
  const id = req.body.lecture_id;
  const lecture_path = req.body.lecture_path;
  const lecture_topic = req.body.lecture_topic;
  const lecture_description = req.body.lecture_description;
  Lecture.update(
    {
      lecture_path,
      lecture_topic,
      lecture_description,
    },
    {
      where: {
        id,
      },
    }
  )
    .then((result) => {
      res.json({
        message: "Lecture details succesfully updated",
      });
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
      console.log(err);
    });
});

router.post("/updateTeacher", verifyToken, async (req, res) => {
  const teacher_id = req.body.teacher_id;
  const teacher_name = req.body.teacher_name;
  const teacher_email = req.body.teacher_email;
  const teacher_phone = req.body.teacher_mobile;
  Teacher.update(
    {
      teacher_id,
      teacher_name,
      teacher_email,
      teacher_phone,
    },
    {
      where: {
        teacher_id,
      },
    }
  )
    .then((result) => {
      if (result) {
        res.json({
          message: "Teacher details succesfully updated",
        });
      } else {
        res.json({
          error: "No teachers were found",
        });
      }
    })
    .catch((err) => {
      res.json(err.message);
      console.log(err);
    });
});

router.post("/updateStudent", verifyToken, async (req, res) => {
  const student_id = req.body.student_id;
  const student_name = req.body.student_name;
  const student_email = req.body.student_email;
  const student_phone = req.body.student_phone;
  Student.update(
    {
      student_name,
      student_email,
      student_phone,
    },
    {
      where: {
        student_id,
      },
    }
  )
    .then((result) => {
      if (result) {
        res.json({
          message: "Student details are succesfully updated.",
        });
      } else {
        res.json({
          error: "No such student is found",
        });
      }
    })
    .catch((err) => {
      res.json(err.message);
      console.log(err);
    });
});

router.get("/verification", verifyToken, async (req, res) => {
  const bearertoken = req.token;
  let flag = 0;
  login
    .findOne({
      where: {
        bearertoken,
      },
    })
    .then((result) => {
      if (result) {
        flag = 1;
        res.json({
          flag,
        });
      } else {
        res.json({
          flag,
        });
      }
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
    });
});

function randomName(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function verifyToken(req, res, next) {
  // Check if bearer is undefined
  const category = req.body.category;
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    const token = req.headers.authorization.split(" ")[1];

    login
      .findOne({
        where: {
          bearertoken: token,
          category: "admin",
        },
      })
      .then((user) => {
        if (!user) {
          res.json({
            error: "invalid token",
          });
        } else {
          req.token = token;
          next();
        }
      })
      .catch((err) => {
        res.json(err.message);
      });
  } else {
    // Forbidden
    res.json({
      error: "Bearer Token is not found",
    });
  }
}

module.exports = router;
