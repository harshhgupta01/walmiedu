const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Subject = sequelize.define('subject', {
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
    subject_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }

});

module.exports = {
    Subject
};