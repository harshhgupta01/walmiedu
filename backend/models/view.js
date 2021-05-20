const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const View = sequelize.define('view', {
    lecture_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }

});

module.exports = {
    View
};