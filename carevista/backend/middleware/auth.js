const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { sanitizeUser, verifyToken } = require('../utils/security');

const extractBearerToken = (authorizationHeader = '') => {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return '';
  }

  return authorizationHeader.slice(7).trim();
};

const attachAuthenticatedUser = async (req, shouldThrow = true) => {
  const token = extractBearerToken(req.headers.authorization || '');

  if (!token) {
    if (shouldThrow) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    req.user = null;
    return null;
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch (error) {
    if (!shouldThrow) {
      req.user = null;
      return null;
    }

    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(payload.sub).lean();

  if (!user || user.active === false) {
    const error = new Error('User session is no longer valid.');
    error.statusCode = 401;
    throw error;
  }

  const doctorRecord = user.doctorId ? await Doctor.findById(user.doctorId) : null;

  req.user = user;
  req.userView = sanitizeUser(user, doctorRecord);
  req.doctorRecord = doctorRecord;

  return user;
};

const optionalAuth = async (req, res, next) => {
  try {
    await attachAuthenticatedUser(req, false);
    next();
  } catch (error) {
    next(error);
  }
};

const requireAuth = (...roles) => async (req, res, next) => {
  try {
    const user = await attachAuthenticatedUser(req, true);

    if (roles.length > 0 && !roles.includes(user.role)) {
      return res.status(403).json({ error: 'You do not have access to this resource.' });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  optionalAuth,
  requireAuth,
};
