const express = require('express');
const {
  createAppointment,
  createContactMessage,
  getCareDeskOverview,
  getDepartments,
  getDoctors,
  getOverview,
  updateAppointmentStatus,
  updateContactMessageStatus,
} = require('../controllers/siteController');

const router = express.Router();

router.get('/overview', getOverview);
router.get('/departments', getDepartments);
router.get('/doctors', getDoctors);
router.get('/care-desk/overview', getCareDeskOverview);
router.post('/appointments', createAppointment);
router.post('/contact', createContactMessage);
router.patch('/care-desk/appointments/:id', updateAppointmentStatus);
router.patch('/care-desk/messages/:id', updateContactMessageStatus);

module.exports = router;
