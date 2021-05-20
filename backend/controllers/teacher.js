const express = require("express");
const path = require("path");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const nodemailer = require("nodemailer");

const router = express.Router();
const { School } = require("../models/school");
const { login } = require("../models/login");
const { Teacher } = require("../models/teacher");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");
const { Note } = require("../models/notes");
const { Assignment } = require("../models/assignment");
const { Lecture } = require("../models/lecture");
const { Student } = require("../models/student");
const { View } = require("../models/view");
const notes = require("../models/notes");
const { OTP } = require("../models/otp");
const { Submission } = require("../models/responses");
const assignment = require("../models/assignment");
const { verify } = require("crypto");

// Relations
School.hasMany(Teacher, {
  foreignKey: "school_id",
});
Teacher.belongsTo(School, {
  foreignKey: "school_id",
});
Class.hasMany(Subject, {
  foreignKey: "class_id",
});
Subject.belongsTo(Class, {
  foreignKey: "class_id",
});
Student.hasMany(View, {
  foreignKey: "student_id",
});
View.belongsTo(Student, {
  foreignKey: "student_id",
});
Student.hasMany(Submission, {
  foreignKey: "student_id",
});
Submission.belongsTo(Student, {
  foreignKey: "student_id",
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "celebalmailtest@gmail.com",
    pass: "Testing@12345?",
  },
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  Teacher.findOne({
    where: {
      teacher_email: email,
    },
  })
    .then((user) => {
      if (!user) {
        res.json({
          error: "User not found",
        });
      } else {
        if (password === user.teacher_password) {
          const bearertoken = Math.floor(Math.random() * 10000001);
          login
            .create({
              secretkey: user.teacher_id,
              bearertoken: bearertoken,
              category: "teacher",
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
  const teacher_email = req.body.email;
  const token = randomName(25);
  const otp = Math.floor(Math.random() * 100000001);
  Teacher.findOne({
    where: {
      teacher_email,
    },
  })
    .then((result) => {
      if (result) {
        const mailOptions = {
          to: teacher_email,
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
              email: teacher_email,
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
            Teacher.update(
              {
                teacher_password: new_password,
              },
              {
                where: {
                  teacher_email: email,
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

router.get("/profile", verifyToken, async (req, res) => {
  const teacher_id = req.teacher_id;
  Teacher.findOne({
    include: [
      {
        model: School,
        required: true,
        attributes: ["school_name", "school_address"],
      },
    ],
    where: {
      teacher_id,
    },
    attributes: ["teacher_name", "teacher_email", "teacher_phone"],
  })
    .then((profile) => {
      if (profile) {
        res.json(profile);
      } else {
        res.json({
          error: "No user found",
        });
      }
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
    });
});

router.get("/viewTeacherSubjects", verifyToken, async (req, res) => {
  const teacher_id = req.teacher_id;
  Subject.findAll({
    include: [
      {
        model: Class,
        required: true,
      },
    ],
    where: {
      teacher_id,
    },
  })
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.json({
          error: "no subjects were allotted to this teacher",
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

router.get("/viewSubject/:subject_id", verifyToken, async (req, res) => {
  const subject_id = req.params.subject_id;
  const teacher_id = req.teacher_id;
  Subject.findOne({
    where: {
      id: subject_id,
      teacher_id,
    },
    attributes: ["subject_name", "id"],
  })
    .then((subject) => {
      if (subject) {
        Lecture.count({
          where: {
            subject_id,
            teacher_id,
          },
        })
          .then((count) => {
            if (count) {
              Lecture.findAll({
                where: {
                  subject_id,
                  teacher_id,
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
});

router.post("/addStudents", verifyToken, async (req, res) => {
  const teacher_id = req.teacher_id;
  const student_name = req.body.student_name;
  const student_email = req.body.student_email;
  const student_password = req.body.student_password;
  const student_phone = req.body.student_phone;
  Class.findOne({
    where: {
      teacher_id,
    },
  })
    .then((result) => {
      if (result) {
        const class_id = result.class_id;
        const school_id = result.school_id;
        Student.create({
          student_name,
          student_email,
          student_password,
          student_phone,
          class_id,
          school_id,
        })
          .then((student) => {
            res.json({
              message: "Student added successfully",
            });
          })
          .catch((error) => {
            res.json({
              error: error.message,
            });
            console.log(error);
          });
      } else {
        res.json({
          error: "This teacher is not a class teacher",
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

router.post("/deleteStudent", verifyToken, async (req, res) => {
  const teacher_id = req.teacher_id;
  const student_id = req.body.student_id;
  Class.findOne({
    where: {
      teacher_id,
    },
  })
    .then((result) => {
      if (result) {
        const class_id = result.class_id;
        Student.destroy({
          where: {
            class_id,
            student_id,
          },
        })
          .then((user) => {
            res.json({
              message: "Student Successfully deleted",
            });
          })
          .catch((err) => {
            res.json({
              error: err.message,
            });
          });
      } else {
        res.json({
          error: "You are not a class teacher",
        });
      }
    })
    .catch((error) => {
      res.json({
        error: error.message,
      });
    });
});

router.post("/updateStudent", verifyToken, async (req, res) => {
  const teacher_id = req.teacher_id;
  const student_id = req.body.student_id;
  const student_name = req.body.student_name;
  const student_email = req.body.student_email;
  const student_phone = req.body.student_phone;
  Class.findOne({
    where: {
      teacher_id,
    },
  })
    .then((result) => {
      if (result) {
        const class_id = result.class_id;
        Student.update(
          {
            student_name,
            student_email,
            student_phone,
          },
          {
            where: {
              class_id,
              student_id,
            },
          }
        )
          .then((user) => {
            res.json({
              message: "Student details are successfully updated",
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
          error: "You are not a class teacher",
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

router.get("/lectureViews/:lecture_id", verifyToken, async (req, res) => {
  const lecture_id = req.params.lecture_id;
  const teacher_id = req.teacher_id;
  Lecture.findOne({
    where: {
      teacher_id,
      id: lecture_id,
    },
  })
    .then((result1) => {
      if (result1) {
        View.findAll({
          include: [
            {
              model: Student,
              required: true,
              attributes: ["student_name", "student_email", "student_phone"],
            },
          ],
          where: {
            lecture_id,
          },
        })
          .then((result) => {
            if (result) {
              res.json(result);
            } else {
              res.json({
                error: "No students watched this lecture yet.",
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
          error: "This is not your lecture",
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

router.post("/createNote", verifyToken, async (req, res) => {
  const title = req.body.title;
  const subject_id = req.body.subject_id;
  let newFile = req.files.file;
  newFile.name = Date.now() + "-" + newFile.name;
  let uploadPath = "./uploads/notes/" + newFile.name;
  if (!req.files) {
    res.json({
      error: "Please upload a file",
    });
  } else {
    console.log(newFile, uploadPath, newFile.name, title);
    newFile.mv(uploadPath, function (err) {
      if (err) {
        res.json({
          error: err.message,
        });
      } else {
        console.log("File uploaded to" + uploadPath);
        const teacher_id = req.teacher_id;
        Subject.findOne({
          where: {
            id: subject_id,
          },
        })
          .then((result) => {
            const class_id = result.class_id;
            Note.create({
              title,
              file_name: newFile.name,
              subject_id,
              teacher_id,
              class_id,
            })
              .then((note) => {
                res.json({
                  message: "Note successfully added",
                });
              })
              .catch((err) => {
                console.log(err);
                res.json({
                  error: err.message,
                });
              });
          })
          .catch((error) => {
            res.json({
              error: error.message,
            });
            console.log(error);
          });
      }
    });
  }
});

router.post("/deleteNote", verifyToken, async (req, res) => {
  const note_id = req.body.note_id;
  const teacher_id = req.teacher_id;
  Note.findOne({
    where: {
      note_id,
      teacher_id,
    },
  }).then((result1) => {
    if (result1) {
      const file_path = "uploads/notes/" + result1.file_name;
      console.log(file_path);
      fs.unlink(file_path, function (err) {
        if (err) {
          console.log(err);
          res.json({
            error: err.message,
          });
        } else {
          console.log("Successfully deleted the file.");
          Note.destroy({
            where: {
              note_id,
            },
          })
            .then((result) => {
              if (result) {
                res.json({
                  message: "Note Succesfully deleted",
                });
              }
            })
            .catch((err) => {
              console.log(err);
              res.json({
                error: err.message,
              });
            });
        }
      });
    } else {
      res.json({
        error: "No such note found",
      });
    }
  });
});

router.get("/viewNotes/:subject_id", verifyToken, async (req, res) => {
  const subject_id = req.params.subject_id;
  const teacher_id = req.teacher_id;
  Subject.findOne({
    where: {
      id: subject_id,
    },
  })
    .then((result) => {
      if (result) {
        const class_id = result.class_id;
        Note.findAll({
          where: {
            teacher_id,
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
          error: "No such subject found",
        });
      }
    })
    .catch((error) => {
      res.json({
        error: error.message,
      });
    });
});

router.get("/downloadNote/:note_id", async (req, res) => {
  const note_id = req.params.note_id;
  Note.findOne({
    where: {
      note_id,
    },
  })
    .then((note) => {
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

// Assignments

router.post("/createAssignment", verifyToken, async (req, res) => {
  const title = req.body.title;
  const subject_id = req.body.subject_id;
  const submission_date = req.body.submission_date;
  let newFile = req.files.file;
  newFile.name = Date.now() + "-" + newFile.name;
  let uploadPath = "./uploads/assignments/" + newFile.name;
  if (!req.files) {
    res.json({
      error: "Please upload a file",
    });
  } else {
    console.log(newFile, uploadPath, newFile.name, title);
    newFile.mv(uploadPath, function (err) {
      if (err) {
        res.json({
          error: err.message,
        });
      } else {
        console.log("File uploaded to" + uploadPath);
        const teacher_id = req.teacher_id;
        Subject.findOne({
          where: {
            id: subject_id,
            teacher_id,
          },
        })
          .then((result) => {
            const class_id = result.class_id;
            Assignment.create({
              title,
              file_name: newFile.name,
              subject_id,
              teacher_id,
              class_id,
              submission_date,
            })
              .then((assignment) => {
                res.json({
                  message: "Assignment successfully added",
                });
              })
              .catch((err) => {
                console.log(err);
                res.json({
                  error: err.message,
                });
              });
          })
          .catch((error) => {
            res.json({
              error: error.message,
            });
            console.log(error);
          });
      }
    });
  }
});

router.get("/viewAssignments/:subject_id", verifyToken, async (req, res) => {
  const subject_id = req.params.subject_id;
  const teacher_id = req.teacher_id;
  Subject.findOne({
    where: {
      id: subject_id,
    },
  })
    .then((result) => {
      const class_id = result.class_id;
      Assignment.findAll({
        where: {
          teacher_id,
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
    })
    .catch((error) => {
      res.json({
        error: error.message,
      });
    });
});

router.get("/downloadAssignment/:assignment_id", async (req, res) => {
  const assignment_id = req.params.assignment_id;
  Assignment.findOne({
    where: {
      assignment_id,
    },
  })
    .then((assignment) => {
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

router.post("/deleteAssignment", verifyToken, async (req, res) => {
  const assignment_id = req.body.assignment_id;
  const teacher_id = req.teacher_id;
  Assignment.findOne({
    where: {
      assignment_id,
      teacher_id,
    },
  }).then((result1) => {
    if (result1) {
      const file_path = "uploads/assignments/" + result1.file_name;
      console.log(file_path);
      fs.unlink(file_path, function (err) {
        if (err) {
          console.log(err);
          res.json({
            error: err.message,
          });
        } else {
          console.log("Successfully deleted the file.");
          Assignment.destroy({
            where: {
              assignment_id,
            },
          })
            .then((result) => {
              if (result) {
                Submission.destroy({
                  where: {
                    assignment_id,
                  },
                })
                  .then((result2) => {
                    res.json({
                      message: "Assignment Succesfully deleted",
                    });
                  })
                  .catch((err3) => {
                    res.json({
                      error: err3.message,
                    });
                  });
              }
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
  });
});

router.post("/updateAssignment", verifyToken, async (req, res) => {
  const assignment_id = req.body.assignment_id;
  const submission_date = req.body.submission_date;
  const teacher_id = req.teacher_id;
  const title = req.body.title;
  Assignment.update(
    {
      submission_date,
      title,
    },
    {
      where: {
        assignment_id,
        teacher_id,
      },
    }
  )
    .then((result) => {
      res.json({
        message: "Successfully updated the assignment",
      });
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
      console.log(err);
    });
});

router.get("/viewResponse/:assignment_id", verifyToken, async (req, res) => {
  const assignment_id = req.params.assignment_id;
  const teacher_id = req.teacher_id;
  Assignment.findOne({
    where: {
      assignment_id,
      teacher_id,
    },
  }).then((assignment) => {
    if (assignment) {
      Submission.findAll({
        include: [
          {
            model: Student,
            required: true,
          },
        ],
        where: {
          assignment_id,
        },
      }).then((result) => {
        if (result.length != 0) {
          res.json({
            assignment,
            result,
          });
        } else {
          res.json({
            assignment,
            error: "No responses are submitted yet.",
          });
        }
      });
    } else {
      res.json({
        error: "No such assignment",
      });
    }
  });
});

router.get("/downloadResponse/:response_id", async (req, res) => {
  const response_id = req.params.response_id;
  Submission.findOne({
    where: {
      response_id,
    },
  })
    .then((submission) => {
      const file_path = "uploads/responses/" + submission.file_name;
      console.log(file_path);
      res.download(file_path);
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
    });
});

router.get("/viewLecture/:lecture_id", verifyToken, async (req, res) => {
  const lecture_id = req.params.lecture_id;
  const teacher_id = req.teacher_id;
  Lecture.findOne({
    where: {
      teacher_id,
      id: lecture_id,
    },
  })
    .then((result) => {
      if (result) {
        View.findAll({
          include: [
            {
              model: Student,
              required: true,
            },
          ],
          where: {
            lecture_id,
          },
        })
          .then((result2) => {
            if (result2) {
              res.json({
                result,
                result2,
              });
            } else {
              res.json({
                result,
                error: "No one watched the lecture yet",
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
          error: "No such lecture",
        });
      }
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
    });
});

router.post("/updateLecture", verifyToken, async (req, res) => {
  const id = req.body.id;
  const class_id = req.body.class_id;
  const teacher_id = req.body.teacher_id;
  const lecture_topic = req.body.lecture_topic;
  const lecture_description = req.body.lecture_description;
  const subject_id = req.body.subject_id;
  Lecture.update(
    {
      lecture_topic,
      lecture_description,
    },
    {
      where: {
        id,
        class_id,
        teacher_id,
        subject_id,
      },
    }
  )
    .then((result) => {
      if (result) {
        res.json({
          message: "Lecture Successfully updated",
        });
      } else {
        res.json({
          error: "No such lecture found",
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

router.get("/yourClass", verifyToken, async (req, res) => {
  const teacher_id = req.teacher_id;
  Class.findOne({
    where: {
      teacher_id,
    },
  })
    .then((result) => {
      if (result) {
        const class_id = result.class_id;
        Student.count({
          where: {
            class_id,
          },
        })
          .then((strength) => {
            if (strength) {
              Student.findAll({
                where: {
                  class_id,
                },
                attributes: [
                  "student_name",
                  "student_email",
                  "student_phone",
                  "student_id",
                ],
              })
                .then((students) => {
                  res.json({
                    result,
                    strength,
                    students,
                  });
                })
                .catch((err) => {
                  res.json({
                    error: err.message,
                  });
                });
            } else {
              res.json({
                result,
                error: "No students are added to this class",
              });
            }
          })
          .catch((err1) => {
            res.json({
              result,
              error: err1.message,
            });
          });
      } else {
        res.json({
          error: "You are not assigned to any class",
        });
      }
    })
    .catch((err2) => {
      res.json({
        error: err2.message,
      });
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
          category: "teacher",
        },
      })
      .then((user) => {
        if (!user) {
          res.json({
            error: "invalid token",
          });
        } else {
          req.token = token;
          req.teacher_id = user.secretkey;
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
