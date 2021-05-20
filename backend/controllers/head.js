const express = require("express");
const sequelize = require("sequelize");
const nodemailer = require("nodemailer");

const router = express.Router();
const {
  School
} = require("../models/school");
const {
  Class
} = require("../models/class");
const {
  Teacher
} = require("../models/teacher");
const {
  login
} = require("../models/login");
const {
  Subject
} = require("../models/subject");
const {
  Lecture
} = require("../models/lecture");
const {
  Student
} = require("../models/student");
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

// Relations
Class.hasMany(Subject, {
  foreignKey: "class_id",
});
Subject.belongsTo(Class, {
  foreignKey: "class_id",
});
Class.belongsTo(Teacher, {
  foreignKey: "teacher_id",
});
Teacher.hasMany(Class, {
  foreignKey: "teacher_id",
});
Class.hasMany(Student, {
  foreignKey: "class_id",
});
Student.belongsTo(Class, {
  foreignKey: "class_id",
});
Teacher.hasMany(Subject, {
  foreignKey: "teacher_id",
});
Subject.belongsTo(Teacher, {
  foreignKey: "teacher_id",
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "celebalmailtest@gmail.com",
    pass: "Testing@12345?",
  },
});

// LOGIN

router.post("/login", async (req, res) => {
  const head_email = req.body.email;
  const head_password = req.body.password;
  School.findOne({
      where: {
        head_email,
        head_password,
      },
    })
    .then((user) => {
      if (!user) {
        res.json({
          error: "User not found",
        });
      } else {
        const bearertoken = Math.floor(Math.random() * 10001);
        login
          .create({
            secretkey: user.school_id,
            bearertoken: bearertoken,
            category: "head",
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
      }
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
      console.log(err);
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
      res.json({
        error: err.message,
      });
    });
});

router.post("/forgotPassword", async (req, res) => {
  const email = req.body.email;
  const token = randomName(25)
  const otp = Math.floor(Math.random() * 100000001);
  School.findOne({
      where: {
        head_email: email,
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
        transporter
          .sendMail(mailOptions, function (error, info) {
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
          })

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

router.post('/resetPassword', async (req, res) => {
  const otp = req.body.otp;
  const token = req.body.token;
  OTP.findOne({
    where: {
      token
    }
  }).then(result => {
    let attempts = result.attempts;
    if (attempts > 2) {
      res.json({
        error: 'Too many attempts'
      })
    } else {
      OTP.findOne({
        where: {
          token,
          otp
        }
      }).then(user => {
        if (user) {

          OTP.update({
            flag: 1
          }, {
            where: {
              token,
              otp
            }
          }).then(user2 => {
            res.json({
              message: 'OTP verified successfully'
            })
          }).catch(err => {
            res.json({
              error: err.message
            })
          })
        } else {
          attempts += 1;
          OTP.update({
            attempts
          }, {
            where: {
              token
            }
          }).then(user2 => {
            res.json({
              error: 'Invalid OTP'
            })
          }).catch(err => {
            res.json({
              error: err.message
            })
          })
        }
      }).catch(error => {
        res.json({
          error: error.message
        })
      })
    }
  }).catch(error2 => {
    res.json({
      error: error2.message
    })
  })
})

router.post('/newPassword', async (req, res) => {
  const new_password = req.body.password;
  const confirm_password = req.body.confirmpassword;
  const token = req.body.token;
  if (!new_password || !confirm_password || !token) {
    res.json({
      error: 'We could not recieve the correct details'
    })
  } else {
    if (new_password == confirm_password) {
      OTP.findOne({
        where: {
          token
        }
      }).then(result => {
        if (result.flag == 1) {
          const email = result.email;
          School.update({
            head_password: new_password
          }, {
            where: {
              head_email: email
            }
          }).then(user => {
            OTP.destroy({
              where: {
                token
              }
            }).then(user2 => {
              res.json({
                message: 'Password successfully updated'
              })
            }).catch(err1 => {
              res.json({
                error: err1.message
              })
              console.log(err1)
            })

          }).catch(err => {
            res.json({
              error: err.message
            })
          })
        } else {
          res.json({
            error: 'OTP not verified'
          })
        }
      }).catch(error => {
        res.json({
          error: error.message
        })
      })
    } else {
      res.json({
        error: 'Please enter same password in both the fields'
      })
    }
  }
})

// CLASS => (CREATE, VIEW, UPDATE, DELETE)

router.get('/profile', verifyToken, async (req, res) => {
  const school_id = req.school_id;
  School.findOne({
    where: {
      school_id
    },
    attributes: ["school_name", "head", "head_email"]
  }).then(profile => {
    if (profile) {
      res.json(profile)
    } else {
      res.json({
        error: 'No user found'
      })
    }
  }).catch(err => {
    res.json({
      error: err.message
    })
  })
})

router.post("/createClass", verifyToken, async (req, res) => {
  const school_id = req.school_id;
  const class_name = req.body.class_name;
  const teacher_id = req.body.class_teacher_id;
  Class.findOne({
    where: {
      class_name,
      school_id,
    },
  }).then((result) => {
    if (!result) {
      Class.findOne({
        where: {
          teacher_id
        }
      }).then(class_teacher => {
        if (class_teacher) {
          res.json({
            error: 'A teacher cannot be a class teacher of more than one class'
          })
        } else {
          Class.create({
              school_id,
              class_name,
              teacher_id,
            })
            .then((result) => {
              console.log(result);
              res.json({
                message: "Class added succesfully",
              });
            })
            .catch((err) => {
              res.json({
                error: err.message,
              });
              console.log(err);
            });
        }
      }).catch(err2 => {
        res.json({
          error: err2.message
        })
        console.log(err2)
      })

    } else {
      res.json({
        error: "Same class exists.",
      });
    }
  }).catch(err3 => {
    res.json({
      error: err3.message
    })
    console.log(err3)
  })
});

router.get("/viewClasses", verifyToken, async (req, res) => {
  const school_id = req.school_id;
  Class.findAll({
      where: {
        school_id,
      },
      include: {
        attributes: ["teacher_name", "teacher_id"],
        model: Teacher,
        required: true,
      },
    })
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.json({
          error: "No classes found",
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

router.get("/vewClass/:class_id", verifyToken, async (req, res) => {
  const class_id = req.params.class_id;
  const school_id = req.school_id;
  Class.findOne({
      where: {
        class_id,
        school_id
      },
      include: {
        attributes: ["teacher_name", "teacher_email"],
        model: Teacher,
        required: true,
      },
    })
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.json({
          error: "No such class is found",
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

router.get("/viewClassStrength/:class_id", verifyToken, async (req, res) => {
  const class_id = req.params.class_id;
  const school_id = req.school_id;
  Student.count({
      where: {
        class_id,
        school_id
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

router.get("/viewClassSubjects/:class_id", verifyToken, async (req, res) => {
  const class_id = req.params.class_id;
  const school_id = req.school_id;
  Class.findOne({
    where: {
      class_id,
      school_id
    }
  }).then(result1 => {
    if (result1) {
      Subject.findAll({
          where: {
            class_id,
          },
          include: {
            attributes: ["teacher_name", "teacher_email"],
            model: Teacher,
            required: true,
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
          console.log(err);
        });
    } else {
      res.json({
        error: 'Invalid Details'
      })
    }
  }).catch(error => {
    res.json({
      error: error.message
    })
    console.log(error)
  })

});

router.get("/viewClassStudents/:class_id", verifyToken, async (req, res) => {
  const class_id = req.params.class_id;
  const school_id = req.school_id;
  Student.findAll({
      where: {
        class_id,
        school_id,
      },
      attributes: [
        "student_id",
        "student_name",
        "student_email",
        "student_phone",
      ],
    })
    .then((result) => {
      console.log(result);
      res.json(result);
    })
    .catch((err) => {
      res.json({
        error: err.message,
      });
      console.log(err);
    });
});

router.post('/updateClass', verifyToken, async (req, res) => {
  const class_id = req.body.class_id;
  const class_name = req.body.class_name;
  const teacher_id = req.body.class_teacher_id;
  const school_id = req.school_id;
  Class.findOne({
    where: {
      class_id,
      teacher_id
    }
  }).then(result => {
    if (result) {
      Class.update({
        class_name
      }, {
        where: {
          class_id,
          school_id
        }
      }).then(result5 => {
        if (result5) {
          res.json({
            message: "Class Successfully updated"
          })
        } else {
          res.json({
            error: 'No such class found in your school'
          })
        }

      }).catch(err5 => {
        res.json({
          error: err5.message
        })
        console.log(err5)
      })
    } else {
      Class.findOne({
        where: {
          teacher_id
        }
      }).then(result2 => {
        if (result2) {
          res.json({
            error: 'A teacher cannot be a class teacher of more than one class'
          })
        } else {
          Class.update({
            class_name,
            teacher_id
          }, {
            where: {
              class_id,
              school_id
            }
          }).then(result3 => {
            if (result3) {
              res.json({
                message: 'Class details updated successfully'
              })
            } else {
              res.json({
                error: 'No such class found in your school'
              })
            }
          }).catch(err3 => {
            res.json({
              error: err3.message
            })
            console.log(err3)
          })
        }
      }).catch(err2 => {
        res.json({
          error: err2.message
        })
        console.log(err2)
      })
    }
  }).catch(err => {
    res.json({
      error: err.message
    })
    console.log(err)
  })
})

// router.post("/updateClass", verifyToken, async (req, res) => {
//   const class_id = req.body.class_id;
//   const class_name = req.body.class_name;
//   const teacher_id = req.body.class_teacher_id;
//   const school_id = req.school_id;
//   Class.findOne({
//     where: {
//       teacher_id
//     }
//   }).then(class_teacher => {
//     if (class_teacher) {
//       res.json({
//         error: 'A teacher cannot be a class teacher of more than one class'
//       })
//     } else {
//       Class.update({
//           class_name,
//           teacher_id,
//         }, {
//           where: {
//             class_id,
//             school_id
//           },
//         })
//         .then((result) => {
//           if (result) {
//             res.json({
//               message: "Succesfully updated teacher details",
//             });
//           } else {
//             res.json({
//               error: "No such teacher was found",
//             });
//           }
//         })
//         .catch((err) => {
//           res.json({
//             error: {
//               error: err.message,
//             },
//           });
//           console.log(err);
//         });
//     }
//   }).catch(err2 => {
//     res.json({
//       error: err2.message
//     })
//     console.log(err2)
//   })

// });

router.post("/deleteClass", verifyToken, async (req, res) => {
  const class_id = req.body.class_id;
  const school_id = req.school_id;
  Class.findOne({
    where: {
      class_id,
      school_id
    }
  }).then(result2 => {
    if (result2) {
      Lecture.findAll({
        where: {
          class_id
        }
      }).then(lectures => {
        if (lectures.length != 0) {
          res.json({
            error: 'Please ask admin to delete all the lectures of this class first'
          })
        } else {
          Class.destroy({
              where: {
                class_id,
                school_id,
              },
            })
            .then((result) => {
              if (result) {
                res.json({
                  message: "Class succesfully deleted",
                });
                console.log(result);
              } else {
                res.json({
                  error: "no such class exists",
                });
              }
            })
            .catch((err) => {
              res.json({
                error: {
                  error: err.message,
                },
              });
              console.log(err);
            });
        }
      }).catch(err2 => {
        res.json({
          error: err2.message
        })
        console.log(err2)
      })
    } else {
      res.json({
        error: 'No such class found in your school'
      })
    }
  })


});

// TEACHER => (ADD, UPDATE, VIEW, DELETE)

router.post("/addTeacher", verifyToken, async (req, res) => {
  const school_id = req.school_id;
  const teacher_name = req.body.teacher_name;
  const teacher_email = req.body.teacher_email;
  const teacher_password = req.body.teacher_password;
  const teacher_phone = req.body.teacher_mobile;
  Teacher.findOne({
      where: {
        teacher_email,
        school_id
      },
    })
    .then((result) => {
      if (!result) {
        Teacher.create({
            school_id,
            teacher_name,
            teacher_email,
            teacher_password,
            teacher_phone
          })
          .then((result) => {
            console.log(result);
            res.json({
              message: "Teacher succesfully added.",
            });
          })
          .catch((err) => {
            res.json({
              error: {
                error: err.message,
              },
            });
            console.log(err);
          });
      } else {
        res.json({
          error: "Same teacher exists.",
        });
      }
    })
    .catch((err) => {
      res.json({
        error: {
          error: err.message,
        },
      });
      console.log(err);
    });
});

router.post("/updateTeacher", verifyToken, async (req, res) => {
  const teacher_id = req.body.teacher_id;
  const teacher_name = req.body.teacher_name;
  const teacher_email = req.body.teacher_email;
  const teacher_phone = req.body.teacher_mobile;
  const school_id = req.school_id;
  Teacher.update({
      teacher_name,
      teacher_email,
      teacher_phone
    }, {
      where: {
        teacher_id,
        school_id,
      },
    })
    .then((result) => {
      res.json({
        message: "Teacher Details successfully updated",
      });
    })
    .catch((err) => {
      res.json({
        error: {
          error: err.message,
        },
      });
    });
});

router.get("/viewTeachers", verifyToken, async (req, res) => {
  const school_id = req.school_id;
  Teacher.findAll({
      where: {
        school_id,
      },
    })
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.json({
          error: "no teachers were added",
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

router.post("/deleteTeacher", verifyToken, async (req, res) => {
  const teacher_id = req.body.teacher_id;
  const school_id = req.school_id;
  Lecture.findAll({
    where: {
      teacher_id
    }
  }).then(lectures => {
    if (lectures.length != 0) {
      res.json({
        error: 'Please ask admin to delete all the lectures first'
      })
    } else {
      Teacher.destroy({
          where: {
            teacher_id,
            school_id
          },
        })
        .then((result) => {
          if (result) {
            res.json({
              message: "Teacher succesfully deleted",
            });
          } else {
            res.json({
              error: "No such teachers were found",
            });
          }
        })
        .catch((err) => {
          res.json({
            error: err.message,
          });
          console.log(err);
        });
    }
  }).catch(err2 => {
    res.json({
      error: err2.message
    })
    console.log(err2)
  })

});

// SUBJECT => (ADD, UPDATE, DELETE)

router.post("/addSubject", verifyToken, async (req, res) => {
  const class_id = req.body.class_id;
  const teacher_id = req.body.teacher_id;
  const subject_name = req.body.subject_name;
  const school_id = req.school_id;
  Class.findOne({
    where: {
      class_id,
      school_id
    }
  }).then(result2 => {
    if (result2) {
      Teacher.findOne({
        where: {
          teacher_id,
          school_id
        }
      }).then(result3 => {
        if (result3) {
          Subject.findOne({
              where: {
                class_id,
                subject_name,
              },
            })
            .then((result) => {
              if (!result) {
                Subject.create({
                    class_id,
                    teacher_id,
                    subject_name,
                  })
                  .then((subject) => {
                    res.json({
                      message: "Subject added Successfully.",
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
                  error: "subject already in the class",
                });
              }
            })
            .catch((error) => {
              console.log(error);

              res.json(error.message);
            });
        } else {
          res.json({
            error: 'No such teacher exists in your school'
          })
        }
      }).catch(err3 => {
        res.json({
          error: err3.message
        })
        console.log(err3)
      })
    } else {
      res.json({
        error: 'No such class exists in your school'
      })
    }
  }).catch(err2 => {
    if (err2) {
      res.json({
        error: err2.message
      })
      console.log(err2)
    }
  })

});

router.post("/updateSubject", verifyToken, async (req, res) => {
  const id = req.body.subject_id;
  const subject_name = req.body.subject_name;
  const teacher_id = req.body.teacher_id;
  const school_id = req.school_id;
  Subject.findOne({
    where: {
      id
    }
  }).then(result2 => {
    if (result2) {
      const class_id = result2.class_id;
      Class.findOne({
        where: {
          class_id,
          school_id
        }
      }).then(result3 => {
        if (result3) {
          Subject.findOne({
            where: {
              id,
              subject_name
            }
          }).then(result4 => {
            if (result4) {
              Subject.update({
                  subject_name,
                  teacher_id,
                }, {
                  where: {
                    id,
                  },
                })
                .then((result) => {
                  Note.update({
                      teacher_id,
                    }, {
                      where: {
                        subject_id: id,
                      },
                    })
                    .then((note) => {
                      console.log("Teacher Id in notes updated");
                    })
                    .catch((err1) => {
                      console.log(err1);
                      res.json({
                        error: err1.message,
                      });
                    });
                  res.json({
                    message: "Subject successfully updated",
                  });
                })
                .catch((err) => {
                  res.json({
                    error: err.message,
                  });
                  console.log(err);
                });
            } else {
              Subject.findOne({
                where: {
                  subject_name,
                  class_id
                }
              }).then(result5 => {
                if (result5) {
                  res.json({
                    error: 'Same subject exists in the class'
                  })
                } else {
                  Subject.update({
                      subject_name,
                      teacher_id,
                    }, {
                      where: {
                        id,
                      },
                    })
                    .then((result) => {
                      Note.update({
                          teacher_id,
                        }, {
                          where: {
                            subject_id: id,
                          },
                        })
                        .then((note) => {
                          console.log("Teacher Id in notes updated");
                        })
                        .catch((err1) => {
                          console.log(err1);
                          res.json({
                            error: err1.message,
                          });
                        });
                      res.json({
                        message: "Subject successfully updated",
                      });
                    })
                    .catch((err) => {
                      res.json({
                        error: err.message,
                      });
                      console.log(err);
                    });
                }
              }).catch(err5 => {
                res.json({
                  error: err5.message
                })
                console.log(err5)
              })
            }
          }).catch(err4 => {
            res.json({
              error: err4.message
            })
            console.log(err4)
          })
        } else {
          res.json({
            error: 'No such class exists in your school'
          })
        }
      }).catch(err3 => {
        res.json({
          error: err3.message
        })
        console.log(err3)
      })
    } else {
      res.json({
        error: 'No such subject exists'
      })
    }
  }).catch(err2 => {
    res.json({
      error: err2.message
    })
    console.log(err2)
  })

});

router.post("/deleteSubject", verifyToken, async (req, res) => {
  const id = req.body.subject_id;
  const school_id = req.school_id;
  Lecture.findAll({
    where: {
      subject_id: id
    }
  }).then(lectures => {
    if (lectures.length != 0) {
      res.json({
        error: 'Please ask admin to delete all the lectures of this subject first'
      })
    } else {
      Subject.findOne({
        where: {
          id
        }
      }).then(result2 => {
        if (result2) {
          const class_id = result2.class_id;
          Class.findOne({
            where: {
              class_id,
              school_id
            }
          }).then(result1 => {
            if (result1) {
              Subject.destroy({
                where: {
                  id
                }
              }).then(result => {
                res.json({
                  message: 'Successfully deleted the subject'
                })
              }).catch(err1 => {
                res.json({
                  error: err1.message
                })
                console.log(err1)
              })
            } else {
              res.json({
                error: 'No such subject exists in your school'
              })
            }
          }).catch(err1 => {
            res.json({
              error: err1.message
            })
            console.log(err1)
          })
        } else {
          res.json({
            error: 'No such subject exists'
          })
        }
      }).catch(err2 => {
        res.json({
          error: err2.message
        })
        console.log(err2)
      })


    }

  }).catch(err4 => {
    res.json({
      error: err4.message
    })
    console.log(err4)
  })
});

// VIEW TEACHER'S SUBJECTS/CLASS

router.get("/viewTeacherSubjects", verifyToken, async (req, res) => {
  const teacher_id = req.body.teacher_id;
  const school_id = req.school_id;
  Teacher.findOne({
    where: {
      teacher_id,
      school_id
    }
  }).then(result1 => {
    if (result1) {
      Subject.findAll({
          include: [{
            model: Class,
            required: true,
          }, ],
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
    } else {
      res.json({
        error: 'No such Teacher exists in your school'
      })
    }
  }).catch(err1 => {
    res.json({
      error: err1.message
    })
    console.log(err1)
  })

});

// VIEW LECTURES OF EACH TEACHER ACCORDING TO EACH CLASS


////////////////////////////////////////
////////////////////////////////////////
//      Done Till here      //
////////////////////////////////////////
////////////////////////////////////////

router.get('/viewTeacherLectures/:subject_id', verifyToken, async (req, res) => {
  const subject_id = req.params.subject_id;
  const school_id = req.school_id;
  Subject.findOne({
    where: {
      id: subject_id
    }
  }).then(user => {
    if (user) {
      const class_id = user.class_id;
      const teacher_id = user.teacher_id;
      Class.findOne({
        where: {
          class_id,
          school_id
        }
      }).then(result1 => {
        if (result1) {
          Lecture.findAll({
            where: {
              subject_id,
              teacher_id
            }
          }).then(result => {
            if (result) {
              res.json(result)
            } else {
              res.json({
                error: 'No lectures are added to this subject yet.'
              })
            }
          }).catch(err => {
            res.json({
              error: err.message
            })
            console.log(err)
          })
        } else {
          res.json({
            error: 'No such subject exists in your class'
          })
        }
      }).catch(err1 => {
        res.json({
          error: err1.message
        })
        console.log(err1)
      })

    } else {
      res.json({
        error: 'No such subjects were found'
      })
    }
  }).catch(error => {
    res.json({
      error: error.message
    })
  })

})


router.get(
  "/viewSubject/:class_id/:teacher_id/:subject_id",
  verifyToken,
  async (req, res) => {
    const class_id = req.params.class_id;
    const id = req.params.subject_id;
    const teacher_id = req.params.teacher_id;
    const school_id = req.school_id;
    Class.findOne({
      where: {
        class_id,
        school_id
      }
    }).then(result1 => {
      if (result1) {
        Subject.findOne({
            include: [{
              model: Teacher,
              attributes: ["teacher_name", "teacher_email"],
              required: true,
            }, ],
            where: {
              id,
            },
          })
          .then((result) => {
            res.json(result);
          })
          .catch((err) => {
            res.json({
              error: err.message,
            });
          });
      } else {
        res.json({
          error: 'No such subject exists in your school'
        })
      }
    }).catch(err1 => {
      res.json({
        error: err1
      })
      console.log(err1)
    })

  }
);

router.get('/viewLecture/:lecture_id', verifyToken, async (req, res) => {
  const lecture_id = req.params.lecture_id;
  const school_id = req.school_id;
  Lecture.findOne({
    where: {
      id: lecture_id
    }
  }).then(result1 => {
    if (result1) {
      const class_id = result1.class_id;
      Class.findOne({
        where: {
          class_id,
          school_id
        }
      }).then(result2 => {
        if (result2) {
          View.findAll({
            include: [{
              model: Student,
              required: true,
            }, ],
            where: {
              lecture_id,
            },
          }).then(result3 => {
            if (result3) {
              res.json({
                result1,
                result3
              })
            } else {
              res.json({
                result1,
                error: 'No students watched the lecture yet'
              })
            }
          }).catch(err1 => {
            res.json({
              error: err1.message
            })
            console.log(err1)
          })
        } else {
          res.json({
            error: 'Inavlid Details'
          })
        }
      }).catch(err2 => {
        res.json({
          error: err2.message
        })
        console.log(err2)
      })
    } else {
      res.json({
        error: 'No such record exists'
      })
    }
  }).catch(err3 => {
    res.json({
      error: err3.message
    })
    console.log(err3)
  })
})

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
        error: err.message
      });
    });
});

function randomName(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
          category: "head",
        },
      })
      .then((user) => {
        if (!user) {
          res.json({
            error: "invalid token",
          });
        } else {
          req.token = token;
          req.school_id = user.secretkey;
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
    res;
  }
}

module.exports = router;