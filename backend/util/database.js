const Sequelize = require("sequelize");

const sequelize = new Sequelize("school", "root", "root", {
  dialect: "mysql",
});

// const sequelize = new Sequelize('prtk', null, null, {
//     host: 'prtk.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
//     port : 1433,
//     dialect : 'mssql',
//     username: 'prtk',
//     password: 'prateekagarwal@9',
//     options:
//     {
//         dialect : 'mssql',
//         database: 'prtk', //update me
//         encrypt: true
//     }
//   });

module.exports = sequelize;
