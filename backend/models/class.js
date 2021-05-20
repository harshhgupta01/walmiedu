const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Class = sequelize.define('class', {
    class_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        validate: {
            notEmpty: true
        }
    },
    school_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    class_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
            notEmpty: true
        }
    }

});

module.exports = {
    Class
};