const Appointment = require('../models/Appointment');
const ContactMessage = require('../models/ContactMessage');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { hashPassword } = require('../utils/security');
const { departments, doctors } = require('./seedData');

const sampleAppointments = [
  {
    patientName: 'Olivia Bennett',
    patientEmail: 'olivia.bennett@example.com',
    patientPhone: '+1 (555) 310-1022',
    department: 'Cardiology',
    doctor: 'Dr. Sarah Mitchell',
    preferredDate: '2026-04-02',
    preferredTime: 'Morning 9-12',
    reason:
      'Recurring chest tightness during exercise and a family history of heart disease.',
    status: 'pending',
    notes: 'Requested earliest available evaluation slot.',
  },
  {
    patientName: 'Harold Green',
    patientEmail: 'harold.green@example.com',
    patientPhone: '+1 (555) 410-9912',
    department: 'Neurology',
    doctor: 'Dr. James Okafor',
    preferredDate: '2026-04-04',
    preferredTime: 'Afternoon 12-5',
    reason: 'Ongoing migraines with occasional dizziness affecting work concentration.',
    status: 'confirmed',
    notes: 'Bring previous MRI report to visit.',
  },
  {
    patientName: 'Sophia Nguyen',
    patientEmail: 'sophia.nguyen@example.com',
    patientPhone: '+1 (555) 288-4311',
    department: 'Pediatrics',
    doctor: 'Dr. Carlos Reyes',
    preferredDate: '2026-04-01',
    preferredTime: 'Morning 9-12',
    reason: 'Child wellness exam and vaccination review before school enrollment.',
    status: 'confirmed',
    notes: 'Parent requested school health form completion.',
  },
  {
    patientName: 'Marcus Hill',
    patientEmail: 'marcus.hill@example.com',
    patientPhone: '+1 (555) 621-7710',
    department: 'Orthopedics',
    doctor: 'Dr. Priya Sharma',
    preferredDate: '2026-04-06',
    preferredTime: 'Evening 5-8',
    reason:
      'Persistent knee pain after a sports injury with reduced mobility for several weeks.',
    status: 'pending',
    notes: 'Patient prefers evening due to work schedule.',
  },
  {
    patientName: 'Elaine Porter',
    patientEmail: 'elaine.porter@example.com',
    patientPhone: '+1 (555) 733-1983',
    department: 'Oncology',
    doctor: 'Dr. Emily Chen',
    preferredDate: '2026-04-08',
    preferredTime: 'Afternoon 12-5',
    reason:
      'Follow-up consultation regarding new biopsy results and treatment planning discussion.',
    status: 'cancelled',
    notes: 'Cancelled by patient due to referral scheduling conflict.',
  },
];

const sampleMessages = [
  {
    name: 'Jordan Ellis',
    email: 'jordan.ellis@example.com',
    subject: 'Need help selecting the right department',
    message:
      'I am experiencing numbness in my hands and frequent headaches, and I am unsure whether I should start with Neurology or another specialty. Could someone guide me before I book?',
    status: 'unread',
  },
  {
    name: 'Patricia Gomez',
    email: 'patricia.gomez@example.com',
    subject: 'Insurance questions before my visit',
    message:
      'I have a scheduled orthopedic consultation next week and need to confirm which insurance documents and referral paperwork I should bring with me.',
    status: 'read',
  },
  {
    name: 'David Kim',
    email: 'david.kim@example.com',
    subject: 'Requesting appointment reschedule',
    message:
      'I submitted a cardiology request for next Tuesday, but I now need an afternoon slot later in the week. Please let me know what is currently available.',
    status: 'resolved',
  },
  {
    name: 'Rachel Owens',
    email: 'rachel.owens@example.com',
    subject: 'Pediatric records transfer',
    message:
      'Our family is moving into the area, and I would like to know the best way to send my daughter\'s vaccination records and previous pediatric notes ahead of her first visit.',
    status: 'unread',
  },
];

const buildDoctorEmail = (doctorName) =>
  `${doctorName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '')}@carevista.health`;

const ensureRoleUsers = async (doctorRecords, appointmentRecords) => {
  const summary = {
    createdAdmins: 0,
    createdDoctors: 0,
    createdPatients: 0,
    linkedAppointments: 0,
  };

  let adminUser = await User.findOne({ email: 'admin@carevista.health' });

  if (!adminUser) {
    adminUser = await User.create({
      name: 'CareVista Admin',
      email: 'admin@carevista.health',
      passwordHash: hashPassword('Admin123!'),
      role: 'admin',
      phone: '+1 (800) 273-8255',
      department: 'Operations',
    });
    summary.createdAdmins += 1;
  }

  const patientUserByEmail = new Map();

  for (const doctor of doctorRecords) {
    const email = buildDoctorEmail(doctor.name);
    let doctorUser = await User.findOne({
      $or: [{ doctorId: doctor._id }, { email }],
    });

    if (!doctorUser) {
      doctorUser = await User.create({
        name: doctor.name,
        email,
        passwordHash: hashPassword('Doctor123!'),
        role: 'doctor',
        phone: '+1 (800) 273-8255',
        department: doctor.department,
        specialty: doctor.specialty,
        doctorId: doctor._id,
      });
      summary.createdDoctors += 1;
      continue;
    }

    let shouldSave = false;

    if (doctorUser.role !== 'doctor') {
      doctorUser.role = 'doctor';
      shouldSave = true;
    }

    if (String(doctorUser.doctorId || '') !== String(doctor._id)) {
      doctorUser.doctorId = doctor._id;
      shouldSave = true;
    }

    if (doctorUser.department !== doctor.department) {
      doctorUser.department = doctor.department;
      shouldSave = true;
    }

    if (doctorUser.specialty !== doctor.specialty) {
      doctorUser.specialty = doctor.specialty;
      shouldSave = true;
    }

    if (!doctorUser.phone) {
      doctorUser.phone = '+1 (800) 273-8255';
      shouldSave = true;
    }

    if (shouldSave) {
      await doctorUser.save();
    }
  }

  const patientCandidates = appointmentRecords.filter(
    (appointment) => appointment.patientEmail && appointment.patientName
  );

  for (const appointment of patientCandidates) {
    const email = appointment.patientEmail.trim().toLowerCase();
    let patientUser = await User.findOne({ email });

    if (!patientUser) {
      patientUser = await User.create({
        name: appointment.patientName,
        email,
        passwordHash: hashPassword('Patient123!'),
        role: 'patient',
        phone: appointment.patientPhone || '',
      });
      summary.createdPatients += 1;
    } else if (patientUser.role === 'patient') {
      let shouldSave = false;

      if (!patientUser.name) {
        patientUser.name = appointment.patientName;
        shouldSave = true;
      }

      if (!patientUser.phone && appointment.patientPhone) {
        patientUser.phone = appointment.patientPhone;
        shouldSave = true;
      }

      if (shouldSave) {
        await patientUser.save();
      }
    }

    patientUserByEmail.set(email, patientUser);
  }

  const doctorByName = new Map(doctorRecords.map((doctor) => [doctor.name, doctor]));

  for (const appointment of appointmentRecords) {
    const nextPatientUser =
      patientUserByEmail.get((appointment.patientEmail || '').trim().toLowerCase()) || null;
    const nextDoctor = doctorByName.get(appointment.doctor) || null;

    const currentPatientId = String(appointment.patientUser || '');
    const nextPatientId = String(nextPatientUser?._id || '');
    const currentDoctorId = String(appointment.doctorId || '');
    const nextDoctorId = String(nextDoctor?._id || '');

    if (currentPatientId === nextPatientId && currentDoctorId === nextDoctorId) {
      continue;
    }

    appointment.patientUser = nextPatientUser?._id || null;
    appointment.doctorId = nextDoctor?._id || null;
    await appointment.save();
    summary.linkedAppointments += 1;
  }

  return summary;
};

const provisionAccessUsers = async () => {
  const [doctorRecords, appointmentRecords] = await Promise.all([
    Doctor.find(),
    Appointment.find(),
  ]);

  return ensureRoleUsers(doctorRecords, appointmentRecords);
};

const seedDatabase = async () => {
  const departmentCount = await Department.countDocuments();

  if (departmentCount > 0) {
    const provisioning = await provisionAccessUsers();

    console.log(
      Object.values(provisioning).some((value) => value > 0)
        ? `Role users provisioned for existing database data: ${JSON.stringify(provisioning)}`
        : 'Seed skipped because data already exists'
    );
    return;
  }

  await Promise.all([
    Department.deleteMany({}),
    Doctor.deleteMany({}),
    Appointment.deleteMany({}),
    ContactMessage.deleteMany({}),
    User.deleteMany({}),
  ]);

  await Department.insertMany(departments);
  const doctorRecords = await Doctor.insertMany(doctors);
  const doctorRecordByName = new Map(doctorRecords.map((doctor) => [doctor.name, doctor]));

  const insertedAppointments = await Appointment.insertMany(
    sampleAppointments.map((appointment) => ({
      ...appointment,
      doctorId: doctorRecordByName.get(appointment.doctor)?._id || null,
    }))
  );

  await ensureRoleUsers(doctorRecords, insertedAppointments);
  await ContactMessage.insertMany(sampleMessages);

  console.log('Database seeded successfully');
};

module.exports = {
  seedDatabase,
  provisionAccessUsers,
};
