const express = require('express');
const siteController = require('./siteController');

const router = express.Router();

router.get('/site/overview', siteController.getOverview);
router.get('/site/departments', siteController.getDepartments);
router.get('/site/doctors', siteController.getDoctors);
router.get('/site/care-desk/overview', siteController.getCareDeskOverview);
router.post('/site/appointments', siteController.createAppointment);
router.post('/site/contact', siteController.createMessage);
router.patch('/site/care-desk/appointments/:id', siteController.updateAppointmentStatus);
router.patch('/site/care-desk/messages/:id', siteController.updateMessageStatus);

module.exports = router;
