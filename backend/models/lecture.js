const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Lecture = sequelize.define('lecture', {

    class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },

    lecture_path: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            isUrl: true
        }
    },
    lecture_topic: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
            notEmpty: true
        }
    },
    lecture_description: {
        type: Sequelize.STRING,
        allowNull: false
    }

});

module.exports = {
    Lecture
};