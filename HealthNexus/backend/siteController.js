const Appointment = require('./models/Appointment');
const ContactMessage = require('./models/ContactMessage');
const Department = require('./models/Department');
const Doctor = require('./models/Doctor');
const User = require('./models/User');
const siteContent = require('./seed/siteContent');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getOverview = async (req, res, next) => {
  try {
    const [departments, featuredDoctors] = await Promise.all([
      Department.find({}, 'name icon shortDescription').limit(6).lean(),
      Doctor.find({}, 'name specialty department imageUrl bio rating reviewCount')
        .limit(6)
        .lean(),
    ]);

    return res.json({
      hero: siteContent.hero,
      stats: siteContent.stats,
      departments: departments.map((department) => ({
        id: String(department._id),
        name: department.name,
        icon: department.icon,
        shortDescription: department.shortDescription,
      })),
      featuredDoctors: featuredDoctors.map((doctor) => ({
        id: String(doctor._id),
        name: doctor.name,
        specialty: doctor.specialty,
        department: doctor.department,
        imageUrl: doctor.imageUrl,
        bio: doctor.bio,
        rating: doctor.rating,
        reviewCount: doctor.reviewCount,
      })),
      testimonials: siteContent.testimonials,
      faq: siteContent.faq,
      aboutSnippet: siteContent.aboutSnippet,
    });
  } catch (error) {
    return next(error);
  }
};

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 }).lean();
    return res.json({ departments });
  } catch (error) {
    return next(error);
  }
};

const getDoctors = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    const filter = {};

    if (department) {
      filter.department = new RegExp(`^${escapeRegex(department)}$`, 'i');
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: searchRegex }, { specialty: searchRegex }];
    }

    const doctors = await Doctor.find(filter).sort({ name: 1 }).lean();
    return res.json({ doctors });
  } catch (error) {
    return next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const {
      patientName,
      patientEmail,
      patientPhone,
      department,
      doctor,
      preferredDate,
      preferredTime,
      reason,
      notes,
    } = req.body;

    const patientUser = req.user
      ? await User.findById(req.user._id).lean()
      : null;
    const doctorRecord = await Doctor.findOne({ name: doctor }).lean();
    const resolvedPatientName = patientUser?.name || patientName;
    const resolvedPatientEmail = patientUser?.email || patientEmail;
    const resolvedPatientPhone = patientUser?.phone || patientPhone;

    if (
      !resolvedPatientName ||
      !resolvedPatientEmail ||
      !resolvedPatientPhone ||
      !department ||
      !doctor ||
      !preferredDate ||
      !preferredTime ||
      !reason
    ) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const appointment = await Appointment.create({
      patientUser: patientUser?._id || null,
      patientName: resolvedPatientName,
      patientEmail: resolvedPatientEmail,
      patientPhone: resolvedPatientPhone,
      department,
      doctor,
      doctorId: doctorRecord?._id || null,
      preferredDate,
      preferredTime,
      reason,
      notes: notes || '',
      status: 'pending',
    });

    return res.status(201).json(appointment);
  } catch (error) {
    return next(error);
  }
};

const createMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      status: 'unread',
    });

    return res.status(201).json(contactMessage);
  } catch (error) {
    return next(error);
  }
};

const getCareDeskOverview = async (req, res, next) => {
  try {
    const [appointments, messages] = await Promise.all([
      Appointment.find().sort({ createdAt: -1 }).lean(),
      ContactMessage.find().sort({ createdAt: -1 }).lean(),
    ]);

    const stats = {
      totalAppointments: appointments.length,
      pending: appointments.filter((item) => item.status === 'pending').length,
      confirmed: appointments.filter((item) => item.status === 'confirmed').length,
      cancelled: appointments.filter((item) => item.status === 'cancelled').length,
      totalMessages: messages.length,
      unread: messages.filter((item) => item.status === 'unread').length,
    };

    return res.json({
      appointments,
      messages,
      stats,
    });
  } catch (error) {
    return next(error);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid appointment status.' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    appointment.status = status;

    if (typeof req.body.notes === 'string') {
      appointment.notes = req.body.notes.trim();
    }

    await appointment.save();

    return res.json(appointment);
  } catch (error) {
    return next(error);
  }
};

const updateMessageStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['unread', 'read', 'resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid message status.' });
    }

    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    message.status = status;
    await message.save();

    return res.json(message);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getOverview,
  getDepartments,
  getDoctors,
  createAppointment,
  createMessage,
  getCareDeskOverview,
  updateAppointmentStatus,
  updateMessageStatus,
};
