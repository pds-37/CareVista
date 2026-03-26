const Doctor = require('./models/Doctor');
const User = require('./models/User');
const { hashPassword, sanitizeUser, signToken, verifyPassword } = require('./utils/security');

const MIN_PASSWORD_LENGTH = 8;

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
    } = req.body;

    if (!name.trim() || !email.trim() || !password.trim()) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
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

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password.trim()),
      phone: phone.trim(),
      role: 'patient',
    });

    return issueAuthResponse(user, res);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email = '', password = '' } = req.body;

    if (!email.trim() || !password.trim()) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || !verifyPassword(password.trim(), user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
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
