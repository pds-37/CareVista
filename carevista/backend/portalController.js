const Appointment = require('./models/Appointment');
const ContactMessage = require('./models/ContactMessage');
const Department = require('./models/Department');
const Doctor = require('./models/Doctor');
const User = require('./models/User');
const { hashPassword, sanitizeUser } = require('./utils/security');

const appointmentStatusOptions = ['pending', 'confirmed', 'cancelled'];
const messageStatusOptions = ['unread', 'read', 'resolved'];
const MIN_PASSWORD_LENGTH = 8;
const DEFAULT_DOCTOR_PASSWORD = 'Doctor123!';
const defaultDoctorSchedule = {
  weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  startTime: '09:00',
  endTime: '17:00',
  slotDurationMinutes: 30,
  consultationMode: 'In-person and virtual',
  notes: 'Available for scheduled consultations during posted clinic hours.',
};

const buildAppointmentStats = (appointments) => ({
  totalAppointments: appointments.length,
  pending: appointments.filter((item) => item.status === 'pending').length,
  confirmed: appointments.filter((item) => item.status === 'confirmed').length,
  cancelled: appointments.filter((item) => item.status === 'cancelled').length,
});

const mergeSchedule = (schedule = {}) => ({
  ...defaultDoctorSchedule,
  ...schedule,
  weekdays:
    Array.isArray(schedule.weekdays) && schedule.weekdays.length > 0
      ? schedule.weekdays
      : defaultDoctorSchedule.weekdays,
});

const normalizeListField = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const buildDoctorEmailBase = (doctorName = '') =>
  doctorName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '') || 'doctor';

const generateUniqueDoctorEmail = async (doctorName) => {
  const base = buildDoctorEmailBase(doctorName);
  let suffix = '';
  let email = `${base}@carevista.health`;

  while (await User.exists({ email })) {
    suffix = suffix ? `${Number(suffix) + 1}` : '2';
    email = `${base}.${suffix}@carevista.health`;
  }

  return email;
};

const getDoctorRecordForUser = async (user, doctorRecord = null) => {
  if (doctorRecord) {
    return doctorRecord;
  }

  if (user.doctorId) {
    const linkedDoctor = await Doctor.findById(user.doctorId);

    if (linkedDoctor) {
      return linkedDoctor;
    }
  }

  if (user.name) {
    return Doctor.findOne({ name: user.name });
  }

  return null;
};

const getPatientDashboard = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({
      $or: [{ patientUser: req.user._id }, { patientEmail: req.user.email }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      user: sanitizeUser(req.user),
      appointments,
      stats: buildAppointmentStats(appointments),
    });
  } catch (error) {
    return next(error);
  }
};

const cancelPatientAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      $or: [{ patientUser: req.user._id }, { patientEmail: req.user.email }],
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    appointment.status = 'cancelled';
    appointment.notes = req.body.notes?.trim() || appointment.notes || '';
    await appointment.save();

    return res.json(appointment);
  } catch (error) {
    return next(error);
  }
};

const getDoctorDashboard = async (req, res, next) => {
  try {
    const doctorRecord = await getDoctorRecordForUser(req.user, req.doctorRecord);

    if (!doctorRecord) {
      return res.status(404).json({ error: 'Doctor profile not found for this account.' });
    }

    const appointments = await Appointment.find({
      $or: [{ doctorId: doctorRecord._id }, { doctor: doctorRecord.name }],
    })
      .sort({ preferredDate: 1, createdAt: -1 })
      .lean();

    const patientMap = new Map();

    appointments.forEach((appointment) => {
      const patientKey = appointment.patientEmail || String(appointment.patientUser || '');

      if (!patientMap.has(patientKey)) {
        patientMap.set(patientKey, {
          name: appointment.patientName,
          email: appointment.patientEmail,
          phone: appointment.patientPhone,
          lastAppointmentDate: appointment.preferredDate,
        });
      }
    });

    return res.json({
      user: sanitizeUser(req.user, doctorRecord),
      doctor: {
        ...doctorRecord.toObject(),
        schedule: mergeSchedule(doctorRecord.schedule),
      },
      appointments,
      patients: [...patientMap.values()],
      stats: buildAppointmentStats(appointments),
    });
  } catch (error) {
    return next(error);
  }
};

const updateDoctorSchedule = async (req, res, next) => {
  try {
    const doctorRecord = await getDoctorRecordForUser(req.user, req.doctorRecord);

    if (!doctorRecord) {
      return res.status(404).json({ error: 'Doctor profile not found for this account.' });
    }

    const nextSchedule = mergeSchedule({
      ...doctorRecord.schedule?.toObject?.(),
      ...doctorRecord.schedule,
      ...req.body,
    });

    doctorRecord.schedule = nextSchedule;

    if (typeof req.body.available === 'boolean') {
      doctorRecord.available = req.body.available;
    }

    await doctorRecord.save();

    return res.json({
      doctor: {
        ...doctorRecord.toObject(),
        schedule: mergeSchedule(doctorRecord.schedule),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const updateDoctorAppointment = async (req, res, next) => {
  try {
    const doctorRecord = await getDoctorRecordForUser(req.user, req.doctorRecord);

    if (!doctorRecord) {
      return res.status(404).json({ error: 'Doctor profile not found for this account.' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    const ownsAppointment =
      String(appointment.doctorId || '') === String(doctorRecord._id) ||
      appointment.doctor === doctorRecord.name;

    if (!ownsAppointment) {
      return res.status(403).json({ error: 'You cannot update this appointment.' });
    }

    const { status, notes } = req.body;

    if (status && !appointmentStatusOptions.includes(status)) {
      return res.status(400).json({ error: 'Invalid appointment status.' });
    }

    if (status) {
      appointment.status = status;
    }

    if (typeof notes === 'string') {
      appointment.notes = notes.trim();
    }

    appointment.doctorId = doctorRecord._id;
    await appointment.save();

    return res.json(appointment);
  } catch (error) {
    return next(error);
  }
};

const getAdminOverview = async (req, res, next) => {
  try {
    const [users, doctors, departments, appointments, messages] = await Promise.all([
      User.find().sort({ createdAt: -1 }).lean(),
      Doctor.find().sort({ name: 1 }).lean(),
      Department.find().sort({ name: 1 }).lean(),
      Appointment.find().sort({ createdAt: -1 }).lean(),
      ContactMessage.find().sort({ createdAt: -1 }).lean(),
    ]);

    return res.json({
      stats: {
        totalUsers: users.length,
        patientUsers: users.filter((user) => user.role === 'patient').length,
        doctorUsers: users.filter((user) => user.role === 'doctor').length,
        adminUsers: users.filter((user) => user.role === 'admin').length,
        totalDoctors: doctors.length,
        activeDoctors: doctors.filter((doctor) => doctor.available).length,
        totalDepartments: departments.length,
        activeDepartments: departments.filter((department) => department.available).length,
        totalAppointments: appointments.length,
        totalMessages: messages.length,
      },
      users: users.map((user) => sanitizeUser(user)),
      doctors,
      departments,
      appointments,
      messages,
    });
  } catch (error) {
    return next(error);
  }
};

const updateAdminUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (typeof req.body.active === 'boolean') {
      if (String(user._id) === String(req.user._id) && req.body.active === false) {
        return res.status(400).json({ error: 'You cannot disable your own admin account.' });
      }

      user.active = req.body.active;
    }

    if (typeof req.body.phone === 'string') {
      user.phone = req.body.phone.trim();
    }

    if (typeof req.body.department === 'string') {
      user.department = req.body.department.trim();
    }

    if (typeof req.body.specialty === 'string') {
      user.specialty = req.body.specialty.trim();
    }

    await user.save();

    const doctorRecord = user.doctorId ? await Doctor.findById(user.doctorId).lean() : null;

    return res.json(sanitizeUser(user, doctorRecord));
  } catch (error) {
    return next(error);
  }
};

const createAdminDoctor = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const specialty = String(req.body.specialty || '').trim();
    const department = String(req.body.department || '').trim();
    const bio = String(req.body.bio || '').trim();
    const phone = String(req.body.phone || '+1 (800) 273-8255').trim();
    const requestedAccountEmail = String(req.body.accountEmail || '')
      .trim()
      .toLowerCase();
    const temporaryPassword =
      String(req.body.temporaryPassword || DEFAULT_DOCTOR_PASSWORD).trim() ||
      DEFAULT_DOCTOR_PASSWORD;
    const experience = Number(req.body.experience || 0);

    if (!name || !specialty || !department) {
      return res.status(400).json({ error: 'Name, specialty, and department are required.' });
    }

    if (Number.isNaN(experience) || experience < 0) {
      return res.status(400).json({ error: 'Experience must be a valid positive number.' });
    }

    if (temporaryPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `Temporary password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      });
    }

    const accountEmail = requestedAccountEmail || (await generateUniqueDoctorEmail(name));
    const existingUser = await User.findOne({ email: accountEmail });

    if (existingUser) {
      return res.status(409).json({ error: 'A user with this doctor email already exists.' });
    }

    const doctor = await Doctor.create({
      name,
      specialty,
      department,
      bio,
      imageUrl: String(req.body.imageUrl || '').trim(),
      qualifications: normalizeListField(req.body.qualifications),
      experience,
      languages: normalizeListField(req.body.languages),
      available: typeof req.body.available === 'boolean' ? req.body.available : true,
      rating: Number(req.body.rating || 0) || 0,
      reviewCount: Number(req.body.reviewCount || 0) || 0,
      schedule: mergeSchedule({
        consultationMode: String(
          req.body.consultationMode || defaultDoctorSchedule.consultationMode
        ).trim(),
        notes: String(req.body.notes || defaultDoctorSchedule.notes).trim(),
        weekdays: normalizeListField(req.body.weekdays),
        startTime: String(req.body.startTime || defaultDoctorSchedule.startTime).trim(),
        endTime: String(req.body.endTime || defaultDoctorSchedule.endTime).trim(),
        slotDurationMinutes:
          Number(req.body.slotDurationMinutes || defaultDoctorSchedule.slotDurationMinutes) ||
          defaultDoctorSchedule.slotDurationMinutes,
      }),
    });

    const doctorUser = await User.create({
      name,
      email: accountEmail,
      passwordHash: hashPassword(temporaryPassword),
      role: 'doctor',
      phone,
      department,
      specialty,
      doctorId: doctor._id,
    });

    const linkedDepartment = await Department.findOne({ name: department });

    if (linkedDepartment && !linkedDepartment.headDoctor) {
      linkedDepartment.headDoctor = name;
      await linkedDepartment.save();
    }

    return res.status(201).json({
      doctor,
      user: sanitizeUser(doctorUser, doctor),
      credentials: {
        email: accountEmail,
        temporaryPassword,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const updateAdminDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    if (typeof req.body.name === 'string' && req.body.name.trim()) {
      doctor.name = req.body.name.trim();
    }

    if (typeof req.body.available === 'boolean') {
      doctor.available = req.body.available;
    }

    if (typeof req.body.department === 'string' && req.body.department.trim()) {
      doctor.department = String(req.body.department).trim();
    }

    if (typeof req.body.specialty === 'string' && req.body.specialty.trim()) {
      doctor.specialty = String(req.body.specialty).trim();
    }

    if (typeof req.body.bio === 'string') {
      doctor.bio = req.body.bio.trim();
    }

    if (typeof req.body.imageUrl === 'string') {
      doctor.imageUrl = req.body.imageUrl.trim();
    }

    if (req.body.qualifications !== undefined) {
      doctor.qualifications = normalizeListField(req.body.qualifications);
    }

    if (req.body.languages !== undefined) {
      doctor.languages = normalizeListField(req.body.languages);
    }

    if (req.body.experience !== undefined) {
      const experience = Number(req.body.experience);

      if (Number.isNaN(experience) || experience < 0) {
        return res.status(400).json({ error: 'Experience must be a valid positive number.' });
      }

      doctor.experience = experience;
    }

    if (req.body.schedule || req.body.consultationMode || req.body.notes) {
      doctor.schedule = mergeSchedule({
        ...doctor.schedule?.toObject?.(),
        ...doctor.schedule,
        ...(req.body.schedule || {}),
        ...(req.body.consultationMode
          ? { consultationMode: String(req.body.consultationMode).trim() }
          : {}),
        ...(req.body.notes !== undefined ? { notes: String(req.body.notes).trim() } : {}),
      });
    }

    await doctor.save();
    await User.updateMany(
      { doctorId: doctor._id },
      {
        $set: {
          name: doctor.name,
          department: doctor.department,
          specialty: doctor.specialty,
        },
      }
    );

    return res.json(doctor);
  } catch (error) {
    return next(error);
  }
};

const createAdminDepartment = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();

    if (!name) {
      return res.status(400).json({ error: 'Department name is required.' });
    }

    const existingDepartment = await Department.findOne({ name });

    if (existingDepartment) {
      return res.status(409).json({ error: 'A department with this name already exists.' });
    }

    const department = await Department.create({
      name,
      icon: String(req.body.icon || '').trim(),
      description: String(req.body.description || '').trim(),
      shortDescription: String(req.body.shortDescription || '').trim(),
      services: normalizeListField(req.body.services),
      headDoctor: String(req.body.headDoctor || '').trim(),
      available: typeof req.body.available === 'boolean' ? req.body.available : true,
    });

    return res.status(201).json(department);
  } catch (error) {
    return next(error);
  }
};

const updateAdminDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ error: 'Department not found.' });
    }

    if (typeof req.body.available === 'boolean') {
      department.available = req.body.available;
    }

    if (typeof req.body.name === 'string' && req.body.name.trim()) {
      department.name = req.body.name.trim();
    }

    if (typeof req.body.icon === 'string') {
      department.icon = req.body.icon.trim();
    }

    if (typeof req.body.description === 'string') {
      department.description = req.body.description.trim();
    }

    if (typeof req.body.shortDescription === 'string') {
      department.shortDescription = req.body.shortDescription.trim();
    }

    if (req.body.services !== undefined) {
      department.services = normalizeListField(req.body.services);
    }

    if (typeof req.body.headDoctor === 'string') {
      department.headDoctor = String(req.body.headDoctor).trim();
    }

    await department.save();

    return res.json(department);
  } catch (error) {
    return next(error);
  }
};

const updateAdminMessageStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!messageStatusOptions.includes(status)) {
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
  getPatientDashboard,
  cancelPatientAppointment,
  getDoctorDashboard,
  updateDoctorSchedule,
  updateDoctorAppointment,
  getAdminOverview,
  updateAdminUser,
  createAdminDoctor,
  updateAdminDoctor,
  createAdminDepartment,
  updateAdminDepartment,
  updateAdminMessageStatus,
};
