const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.js');
const admin = require('../models/admin.js');

router.get('/admin', adminController.getAuthenticationForm);

router.post('/admin', adminController.postAuthenticationForm);

router.get('/admin/vacancy/new', adminController.getVacancyForm);

router.post('/admin/vacancy/new', adminController.postVacancyForm);

router.get('/admin/applicants', adminController.getApplicants);

router.get('/admin/applicants/:designation', adminController.getApplicantsById);

router.get('/admin/applicants/delete/:applicantId', adminController.deleteApplicantById);

router.get('/admin/vacancy', adminController.getVacancy);

router.get('/admin/vacancy/:vacancyId', adminController.getVacancyById);

router.get('/admin/vacancy/delete/:vacancyId', adminController.deleteVacancyById);



router.get('/admin/deleteuser/:id', adminController.deleteUser);


router.post('/admin/getalldesignations', adminController.getAllDesignations);


// New Routes

router.post('/admin/addschool', adminController.addSchool);

router.post('/admin/newuser', adminController.newUser);

router.get('/admin/getallusers', adminController.getAllUsers);

module.exports = router;