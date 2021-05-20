const express = require("express");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const fs = require("fs");

const router = express.Router();

const {
  School
} = require("../models/school");
const {
  Student
} = require("../models/student");
const {
  Subject
} = require("../models/subject");
const {
  login
} = require("../models/login");
const {
  Lecture
} = require("../models/lecture");
const {
  Class
} = require("../models/class");
const {
  Teacher
} = require("../models/teacher");
const {
  Note
} = require("../models/notes");
const {
  OTP
} = require("../models/otp");
const {
  Assignment
} = require("../models/assignment");
const {
  View
} = require("../models/view");
const {
  Submission
} = require("../models/responses");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "celebalmailtest@gmail.com",
    pass: "Testing@12345?",
  },
});

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({
  storage: storage,
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  Student.findOne({
      where: {
        student_email: email,
      },
    })
    .then((user) => {
      if (!user) {
        res.json({
          error: "User not found",
        });
      } else {
        if (password === user.student_password) {
          const bearertoken = Math.floor(Math.random() * 10000001);
          login
            .create({
              secretkey: user.student_id,
              bearertoken: bearertoken,
              category: "student",
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
  Student.findOne({
      where: {
        student_email: email,
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
              OTP.update({
                  flag: 1,
                }, {
                  where: {
                    token,
                    otp,
                  },
                })
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
              OTP.update({
                  attempts,
                }, {
                  where: {
                    token,
                  },
                })
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
            Student.update({
                student_password: new_password,
              }, {
                where: {
                  student_email: email,
                },
              })
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

router.get("/viewSubjects", verifyToken, async (req, res) => {
  const student_id = req.student_id;
  Student.findOne({
      where: {
        student_id,
      },
    })
    .then((student) => {
      if (student) {
        const class_id = student.class_id;
        const student_name = student.student_name;
        Class.findOne({
            include: [{
              model: School,
              required: true,
              attributes: ["school_name", "school_address"],
            }, ],
            where: {
              class_id,
            },
          })
          .then((student_class) => {
            const class_name = student_class.class_name;
            const school_name = student_class.school.school_name;
            const school_address = student_class.school.school_address;
            if (student_class) {
              Subject.findAll({
                  include: [{
                    model: Teacher,
                    required: true,
                    attributes: ["teacher_name", "teacher_email"],
                  }, ],
                  where: {
                    class_id,
                  },
                })
                .then((subjects) => {
                  if (subjects) {
                    res.json({
                      student_name,
                      class_name,
                      subjects,
                      school_name,
                      school_address
                    });
                  } else {
                    res.json({
                      student_name,
                      class_name,
                      error: "No subjects are added to this class",
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
                student_name,
                error: "No class is allotted to you",
              });
            }
          })
          .catch((err2) => {
            res.json({
              error: err2.message,
            });
            console.log(err2);
          });
      } else {
        res.json({
          error: "Invalid Student Details",
        });
      }
    })
    .catch((err3) => {
      res.json({
        error: err3.message,
      });
      console.log(err3);
    });
});

router.get("/viewSubject/:subject_id", verifyToken, async (req, res) => {
  const subject_id = req.params.subject_id;
  const student_id = req.student_id;
  Student.findOne({
    where: {
      student_id,
    },
  }).then((result4) => {
    if (result4) {
      const class_id = result4.class_id;
      Subject.findOne({
          where: {
            id: subject_id,
            class_id,
          },
          attributes: ["subject_name", "id"],
        })
        .then((subject) => {
          if (subject) {
            Lecture.count({
                where: {
                  subject_id,
                },
              })
              .then((count) => {
                if (count) {
                  Lecture.findAll({
                      where: {
                        subject_id,
                      },
                    })
                    .then((lectures) => {
                      res.json({
                        subject,
                        count,
                        lectures,
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
                    subject,
                    error: "No lectures are added to this subject",
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
        .catch((err) => {
          res.json({
            error: err.message,
          });
          console.log(err);
        });
    } else {
      res.json({
        error: "No such student exists"
      });
    }
  });
});

router.get("/viewNotes/:subject_id", verifyToken, async (req, res) => {
  const subject_id = req.params.subject_id;
  const student_id = req.student_id;
  Student.findOne({
    where: {
      student_id,
    },
  }).then((student) => {
    if (student) {
      const class_id = student.class_id;

      Note.findAll({
          where: {
            class_id,
            subject_id,
          },
        })
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          res.json({
            error: err.message,
          });
          console.log(err);
        });
    } else {
      res.json({
        error: "No notes are added to this subject",
      });
    }
  });
});

router.get("/downloadNote/:note_id", async (req, res) => {
  //   const teacher_id = req.teacher_id;
  const note_id = req.params.note_id;
  Note.findOne({
      where: {
        //   teacher_id,
        note_id,
      },
    })
    .then((note) => {
      //   const file_path = path.join(
      //     __dirname,
      //     "..",
      //     "/uploads/notes/",
      //     note.file_name
      //   );

      const file_path = "uploads/notes/" + note.file_name;
      console.log(file_path);
      res.download(file_path);
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
    });
});

router.get("/viewAssignments/:subject_id", verifyToken, async (req, res) => {
  const subject_id = req.params.subject_id;
  const student_id = req.student_id;
  Student.findOne({
    where: {
      student_id,
    },
  }).then((student) => {
    if (student) {
      const class_id = student.class_id;

      Assignment.findAll({
          where: {
            class_id,
            subject_id,
          },
        })
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          res.json({
            error: err.message,
          });
          console.log(err);
        });
    } else {
      res.json({
        error: "No assignments are given yet",
      });
    }
  });
});

router.get("/downloadAssignment/:assignment_id", async (req, res) => {
  //   const teacher_id = req.teacher_id;
  const assignment_id = req.params.assignment_id;
  Assignment.findOne({
      where: {
        //   teacher_id,
        assignment_id,
      },
    })
    .then((assignment) => {
      //   const file_path = path.join(
      //     __dirname,
      //     "..",
      //     "/uploads/notes/",
      //     note.file_name
      //   );

      const file_path = "uploads/assignments/" + assignment.file_name;
      console.log(file_path);
      res.download(file_path);
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
    });
});

router.post("/createView/:lecture_id", verifyToken, async (req, res) => {
  const student_id = req.student_id;
  const lecture_id = req.params.lecture_id;
  View.findOne({
      where: {
        student_id,
        lecture_id,
      },
    })
    .then((result1) => {
      if (!result1) {
        View.create({
            student_id,
            lecture_id,
          })
          .then((result) => {
            res.json({
              message: "View updated",
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
          error: "You have already watched this lecture",
        });
      }
    })
    .catch((err1) => {
      res.json({
        error: err1.message,
      });
      console.log(err1);
    });
});

router.get("/viewLecture/:lecture_id", verifyToken, async (req, res) => {
  const lecture_id = req.params.lecture_id;
  const student_id = req.student_id;
  Student.findOne({
      where: {
        student_id,
      },
    })
    .then((result1) => {
      if (result1) {
        let class_id = result1.class_id;
        Lecture.findOne({
            where: {
              id: lecture_id,
              class_id,
            },
          })
          .then((result2) => {
            if (result2) {
              res.json({
                result2,
              });
            } else {
              res.json({
                error: "No lecture found",
              });
            }
          })
          .catch((err2) => {
            res.json({
              error: err2.message,
            });
          });
      } else {
        res.json({
          error: "Not a valid student",
        });
      }
    })
    .catch((err1) => {
      res.json({
        error: err1.message,
      });
      console.log(err1);
    });
});

router.post("/submitResponse", verifyToken, async (req, res) => {
  const student_id = req.student_id;
  const assignment_id = req.body.assignment_id;
  let newFile = req.files.file;
  //   let uploadPath = __dirname + "../uploads/notes/";
  newFile.name = Date.now() + '-' + newFile.name;
  let uploadPath = "./uploads/responses/" + newFile.name;
  if (!req.files) {
    res.json({
      error: "Please upload a file",
    });
  } else {
    console.log(newFile, uploadPath, newFile.name);
    Submission.findOne({
        where: {
          student_id,
          assignment_id,
        },
      })
      .then((result) => {
        if (result) {
          res.json({
            error: "Already Submitted!",
          });
        } else {
          Assignment.findOne({
            where: {
              assignment_id
            }
          }).then(result2 => {
            if (result2) {
              submission_date = result2.submission_date + ' 23:59:59';
              let sub_date = new Date(submission_date).getTime();
              if (sub_date < Date.now()) {
                res.json({
                  error: 'You are late for the submission'
                })
              } else {
                newFile.mv(uploadPath, function (err) {
                  if (err) {
                    res.json({
                      error: err.message,
                    });
                  } else {
                    console.log("File uploaded to" + uploadPath);

                    Submission.create({
                        assignment_id,
                        file_name: newFile.name,
                        student_id,
                      })
                      .then((submission) => {
                        res.json({
                          message: "Response successfully submitted",
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                        res.json({
                          error: err.message,
                        });
                      });
                  }
                });
              }
            } else {
              res.json({
                error: 'No such assignment found'
              })
            }
          }).catch(err2 => {
            res.json({
              error: err2.message
            })
            console.log(err2)
          })

        }
      })
      .catch((err1) => {
        res.json({
          error: err1.message,
        });
        console.log(err1);
      });
  }
});

router.get("/viewSubjectList", verifyToken, async (req, res) => {
  const student_id = req.student_id;
  Student.findOne({
      where: {
        student_id,
      },
    })
    .then((student) => {
      if (student) {
        const class_id = student.class_id;
        Subject.findAll({
            where: {
              class_id,
            },
          })
          .then((subjects) => {
            if (subjects) {
              res.json(subjects);
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
            console.log(err);
          });
      } else {
        res.json({
          error: "Invalid Student Details",
        });
      }
    })
    .catch((error) => {
      res.json({
        error: error.message,
      });
      console.log(error);
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
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    const token = req.headers.authorization.split(" ")[1];
    login
      .findOne({
        where: {
          bearertoken: token,
          category: "student",
        },
      })
      .then((user) => {
        if (!user) {
          res.json({
            error: "invalid token",
          });
        } else {
          req.token = token;
          req.student_id = user.secretkey;
          next();
        }
      })
      .catch((err) => {
        res.json({
          error: err.message,
        });
      });
  } else {
    // Forbidden
    res.json({
      error: "Please provide bearer token",
    });
  }
}

module.exports = router;