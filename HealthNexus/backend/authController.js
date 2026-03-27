const Department = require('./models/Department');
const Doctor = require('./models/Doctor');
const User = require('./models/User');
const { hashPassword, sanitizeUser, signToken, verifyPassword } = require('./utils/security');

const MIN_PASSWORD_LENGTH = 8;
const REGISTERABLE_ROLES = ['patient', 'doctor'];
const defaultDoctorSchedule = {
  weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  startTime: '09:00',
  endTime: '17:00',
  slotDurationMinutes: 30,
  consultationMode: 'In-person and virtual',
  notes: 'Available for scheduled consultations during posted clinic hours.',
};

const findDoctorRecordForUser = async (user) => {
  if (!user?.doctorId) {
    return null;
  }

  return Doctor.findById(user.doctorId).lean();
};

const issueAuthResponse = async (user, res) => {
  const doctorRecord = await findDoctorRecordForUser(user);

  return res.json({
    token: signToken({
      sub: String(user._id),
      role: user.role,
      email: user.email,
    }),
    user: sanitizeUser(user, doctorRecord),
  });
};

const register = async (req, res, next) => {
  try {
    const {
      name = '',
      email = '',
      password = '',
      phone = '',
      role = 'patient',
      department = '',
      specialty = '',
      consultationMode = '',
      bio = '',
    } = req.body;
    const normalizedRole = String(role || 'patient').trim().toLowerCase();

    if (!name.trim() || !email.trim() || !password.trim()) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (!REGISTERABLE_ROLES.includes(normalizedRole)) {
      return res
        .status(403)
        .json({ error: 'Only patient and doctor accounts can be created from this form.' });
    }

    if (password.trim().length < MIN_PASSWORD_LENGTH) {
      return res
        .status(400)
        .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    let doctorRecord = null;

    if (normalizedRole === 'doctor') {
      if (!department.trim() || !specialty.trim()) {
        return res
          .status(400)
          .json({ error: 'Department and specialty are required for doctor signup.' });
      }

      const departmentRecord = await Department.findOne({ name: department.trim() }).lean();

      if (!departmentRecord) {
        return res
          .status(400)
          .json({ error: 'Please choose a valid department for the doctor account.' });
      }

      doctorRecord = await Doctor.create({
        name: name.trim(),
        specialty: specialty.trim(),
        department: departmentRecord.name,
        bio: bio.trim(),
        available: true,
        schedule: {
          ...defaultDoctorSchedule,
          consultationMode: consultationMode.trim() || defaultDoctorSchedule.consultationMode,
        },
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password.trim()),
      phone: phone.trim(),
      role: normalizedRole,
      department: doctorRecord?.department || '',
      specialty: doctorRecord?.specialty || '',
      doctorId: doctorRecord?._id || null,
    });

    return issueAuthResponse(user, res);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email = '', password = '', role = '' } = req.body;
    const normalizedRole = String(role || '').trim().toLowerCase();

    if (!email.trim() || !password.trim()) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || !verifyPassword(password.trim(), user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (normalizedRole && user.role !== normalizedRole) {
      return res.status(403).json({ error: `This account is registered as a ${user.role}.` });
    }

    if (user.active === false) {
      return res.status(403).json({ error: 'This account has been disabled.' });
    }

    return issueAuthResponse(user, res);
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const doctorRecord = await findDoctorRecordForUser(req.user);

    return res.json({
      user: sanitizeUser(req.user, doctorRecord),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
