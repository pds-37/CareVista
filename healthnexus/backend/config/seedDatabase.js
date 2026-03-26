const Appointment = require('../models/Appointment');
const ContactMessage = require('../models/ContactMessage');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const { departmentSeed, doctorSeed } = require('./seedData');

const createDateOffset = (daysFromToday) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(0, 0, 0, 0);
  return date;
};

const seedDatabase = async ({ force = false } = {}) => {
  const [departmentCount, doctorCount] = await Promise.all([
    Department.countDocuments(),
    Doctor.countDocuments(),
  ]);

  if (!force && departmentCount > 0 && doctorCount > 0) {
    return { seeded: false, reason: 'Existing departments and doctors found.' };
  }

  await Promise.all([
    Department.deleteMany({}),
    Doctor.deleteMany({}),
    Appointment.deleteMany({}),
    ContactMessage.deleteMany({}),
  ]);

  const createdDepartments = await Department.insertMany(departmentSeed);
  const departmentMap = createdDepartments.reduce((map, department) => {
    map[department.name] = department._id;
    return map;
  }, {});

  const doctorsToInsert = doctorSeed.map((doctor) => ({
    ...doctor,
    department: departmentMap[doctor.department],
  }));

  const createdDoctors = await Doctor.insertMany(doctorsToInsert);

  const doctorMap = createdDoctors.reduce((map, doctor) => {
    map[doctor.slug] = doctor._id;
    return map;
  }, {});

  const sampleAppointments = [
    {
      fullName: 'Riya Sharma',
      email: 'riya.sharma@example.com',
      phone: '+91 9876500011',
      patientType: 'new',
      department: departmentMap.Cardiology,
      doctor: doctorMap['dr-aarya-menon'],
      preferredDate: createDateOffset(1),
      preferredTimeSlot: '10:00 AM - 12:00 PM',
      reason: 'Chest heaviness during climbing and mild shortness of breath.',
      notes: 'Bringing previous ECG reports.',
      status: 'pending',
    },
    {
      fullName: 'Arjun Bose',
      email: 'arjun.bose@example.com',
      phone: '+91 9876500012',
      patientType: 'returning',
      department: departmentMap.Neurology,
      doctor: doctorMap['dr-kavin-rao'],
      preferredDate: createDateOffset(2),
      preferredTimeSlot: '12:00 PM - 02:00 PM',
      reason: 'Follow-up for migraine episodes and medication review.',
      notes: 'Needs early afternoon slot due to work schedule.',
      status: 'confirmed',
    },
    {
      fullName: 'Mira Thomas',
      email: 'mira.thomas@example.com',
      phone: '+91 9876500013',
      patientType: 'new',
      department: departmentMap.Pediatrics,
      doctor: doctorMap['dr-ira-nandakumar'],
      preferredDate: createDateOffset(1),
      preferredTimeSlot: '04:00 PM - 06:00 PM',
      reason: 'Recurring fever and appetite loss for child.',
      notes: 'Parent requests pediatric specialist directly.',
      status: 'pending',
    },
    {
      fullName: 'Sanjay Menon',
      email: 'sanjay.menon@example.com',
      phone: '+91 9876500014',
      patientType: 'corporate',
      department: departmentMap['Preventive Care'],
      doctor: doctorMap['dr-vivaan-chatterjee'],
      preferredDate: createDateOffset(3),
      preferredTimeSlot: '08:00 AM - 10:00 AM',
      reason: 'Annual executive screening and metabolic risk review.',
      notes: 'Corporate wellness package request.',
      status: 'completed',
    },
  ];

  const sampleMessages = [
    {
      fullName: 'Priyanka Iyer',
      email: 'priyanka.iyer@example.com',
      phone: '+91 9876500021',
      subject: 'Need help choosing the right specialty',
      message:
        'The patient has dizziness, fatigue, and intermittent headaches. Please advise whether neurology or preventive care is the better first stop.',
      status: 'new',
    },
    {
      fullName: 'Rahul Nair',
      email: 'rahul.nair@example.com',
      phone: '+91 9876500022',
      subject: 'Reschedule confirmed appointment',
      message:
        'Need to move tomorrow morning appointment to a later slot because of travel. Looking for the earliest available afternoon window.',
      status: 'in-progress',
    },
    {
      fullName: 'Farah Khan',
      email: 'farah.khan@example.com',
      phone: '+91 9876500023',
      subject: 'Insurance desk coordination',
      message:
        'Please confirm what documents are required before we come in for a pulmonology consultation through insurance.',
      status: 'closed',
    },
  ];

  await Promise.all([Appointment.insertMany(sampleAppointments), ContactMessage.insertMany(sampleMessages)]);

  return {
    seeded: true,
    departments: createdDepartments.length,
    doctors: doctorsToInsert.length,
    appointments: sampleAppointments.length,
    messages: sampleMessages.length,
  };
};

module.exports = seedDatabase;
