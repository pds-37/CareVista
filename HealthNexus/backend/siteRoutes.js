const express = require('express');
const siteController = require('./siteController');
const { requireAuth } = require('./middleware/auth');

const router = express.Router();

router.get('/site/overview', siteController.getOverview);
router.get('/site/departments', siteController.getDepartments);
router.get('/site/doctors', siteController.getDoctors);
router.get('/site/care-desk/overview', requireAuth('admin'), siteController.getCareDeskOverview);
router.post('/site/appointments', requireAuth('patient', 'admin'), siteController.createAppointment);
router.post('/site/contact', siteController.createMessage);
router.patch(
  '/site/care-desk/appointments/:id',
  requireAuth('admin'),
  siteController.updateAppointmentStatus
);
router.patch(
  '/site/care-desk/messages/:id',
  requireAuth('admin'),
  siteController.updateMessageStatus
);

module.exports = router;
