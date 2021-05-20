const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const login = sequelize.define('login', {
    secretkey: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    bearertoken: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }

});

module.exports = {
    login
};