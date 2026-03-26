const Appointment = require('../models/Appointment');
const ContactMessage = require('../models/ContactMessage');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const { departments, doctors } = require('./seedData');

const sampleAppointments = [
  {
    patientName: 'Olivia Bennett',
    patientEmail: 'olivia.bennett@example.com',
    patientPhone: '+1 (555) 310-1022',
    department: 'Cardiology',
    doctor: 'Dr. Sarah Mitchell',
    preferredDate: '2026-04-02',
    preferredTime: 'Morning 9–12',
    reason: 'Recurring chest tightness during exercise and a family history of heart disease.',
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
    preferredTime: 'Afternoon 12–5',
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
    preferredTime: 'Morning 9–12',
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
    preferredTime: 'Evening 5–8',
    reason: 'Persistent knee pain after a sports injury with reduced mobility for several weeks.',
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
    preferredTime: 'Afternoon 12–5',
    reason: 'Follow-up consultation regarding new biopsy results and treatment planning discussion.',
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
      'Our family is moving into the area, and I would like to know the best way to send my daughter’s vaccination records and previous pediatric notes ahead of her first visit.',
    status: 'unread',
  },
];

const seedDatabase = async () => {
  const departmentCount = await Department.countDocuments();

  if (departmentCount > 0) {
    console.log('Seed skipped — data already present');
    return;
  }

  await Promise.all([
    Department.deleteMany({}),
    Doctor.deleteMany({}),
    Appointment.deleteMany({}),
    ContactMessage.deleteMany({}),
  ]);

  await Department.insertMany(departments);
  await Doctor.insertMany(doctors);
  await Appointment.insertMany(sampleAppointments);
  await ContactMessage.insertMany(sampleMessages);

  console.log('Database seeded successfully');
};

module.exports = seedDatabase;
