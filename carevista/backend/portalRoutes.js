const express = require('express');
const portalController = require('./portalController');
const siteController = require('./siteController');
const { requireAuth } = require('./middleware/auth');

const router = express.Router();

router.get('/patient/overview', requireAuth('patient', 'admin'), portalController.getPatientDashboard);
router.patch(
  '/patient/appointments/:id/cancel',
  requireAuth('patient', 'admin'),
  portalController.cancelPatientAppointment
);

router.get('/doctor/overview', requireAuth('doctor'), portalController.getDoctorDashboard);
router.patch('/doctor/schedule', requireAuth('doctor'), portalController.updateDoctorSchedule);
router.patch(
  '/doctor/appointments/:id',
  requireAuth('doctor'),
  portalController.updateDoctorAppointment
);

router.get('/admin/overview', requireAuth('admin'), portalController.getAdminOverview);
router.patch('/admin/users/:id', requireAuth('admin'), portalController.updateAdminUser);
router.patch(
  '/admin/appointments/:id',
  requireAuth('admin'),
  siteController.updateAppointmentStatus
);
router.patch(
  '/admin/messages/:id',
  requireAuth('admin'),
  portalController.updateAdminMessageStatus
);
router.post('/admin/doctors', requireAuth('admin'), portalController.createAdminDoctor);
router.patch('/admin/doctors/:id', requireAuth('admin'), portalController.updateAdminDoctor);
router.post('/admin/departments', requireAuth('admin'), portalController.createAdminDepartment);
router.patch(
  '/admin/departments/:id',
  requireAuth('admin'),
  portalController.updateAdminDepartment
);

module.exports = router;
