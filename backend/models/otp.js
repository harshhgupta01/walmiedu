const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const OTP = sequelize.define('otp', {
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            isEmail: true
        }
    },
    otp: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: '0',
        validate: {
            notEmpty: true
        }
    },
    flag: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: '0',
        validate: {
            notEmpty: true
        }
    },
    token: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }

});

module.exports = {
    OTP
};