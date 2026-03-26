const crypto = require('crypto');

const TOKEN_SECRET =
  process.env.JWT_SECRET || 'carevista-dev-secret-change-in-production';
const TOKEN_LIFETIME_SECONDS = Number(
  process.env.JWT_EXPIRES_IN_SECONDS || 60 * 60 * 24 * 7
);
const PASSWORD_ITERATIONS = Number(process.env.PASSWORD_ITERATIONS || 120000);
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = 'sha512';

const toBase64Url = (value) =>
  Buffer.from(value).toString('base64url');

const fromBase64Url = (value) =>
  Buffer.from(value, 'base64url').toString('utf8');

const safeCompare = (left, right) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const digest = crypto
    .pbkdf2Sync(
      password,
      salt,
      PASSWORD_ITERATIONS,
      PASSWORD_KEY_LENGTH,
      PASSWORD_DIGEST
    )
    .toString('hex');

  return `${salt}:${digest}`;
};

const verifyPassword = (password, storedHash = '') => {
  const [salt, expectedDigest] = storedHash.split(':');

  if (!salt || !expectedDigest) {
    return false;
  }

  const computedDigest = crypto
    .pbkdf2Sync(
      password,
      salt,
      PASSWORD_ITERATIONS,
      PASSWORD_KEY_LENGTH,
      PASSWORD_DIGEST
    )
    .toString('hex');

  return safeCompare(computedDigest, expectedDigest);
};

const signToken = (payload) => {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const issuedAt = Math.floor(Date.now() / 1000);
  const tokenPayload = toBase64Url(
    JSON.stringify({
      ...payload,
      iat: issuedAt,
      exp: issuedAt + TOKEN_LIFETIME_SECONDS,
    })
  );
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(`${header}.${tokenPayload}`)
    .digest('base64url');

  return `${header}.${tokenPayload}.${signature}`;
};

const verifyToken = (token = '') => {
  const [header, payload, signature] = token.split('.');

  if (!header || !payload || !signature) {
    throw new Error('Invalid token.');
  }

  const expectedSignature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (!safeCompare(signature, expectedSignature)) {
    throw new Error('Invalid token signature.');
  }

  const decodedPayload = JSON.parse(fromBase64Url(payload));

  if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token has expired.');
  }

  return decodedPayload;
};

const sanitizeUser = (user, doctorRecord = null) => {
  if (!user) {
    return null;
  }

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    department: doctorRecord?.department || user.department || '',
    specialty: doctorRecord?.specialty || user.specialty || '',
    doctorId: doctorRecord?._id ? String(doctorRecord._id) : user.doctorId ? String(user.doctorId) : '',
    active: user.active !== false,
  };
};

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  sanitizeUser,
};
