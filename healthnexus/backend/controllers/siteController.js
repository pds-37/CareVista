const Appointment = require('../models/Appointment');
const ContactMessage = require('../models/ContactMessage');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const {
  careJourney,
  faqs,
  hospitalHighlights,
  quickFacts,
  testimonials,
} = require('../config/siteContent');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const appointmentStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
const messageStatuses = ['new', 'in-progress', 'closed'];

const findDepartment = async (value) => {
  if (!value) {
    return null;
  }

  return Department.findOne({
    $or: [
      { slug: value.trim().toLowerCase() },
      { name: new RegExp(`^${escapeRegex(value.trim())}$`, 'i') },
    ],
  });
};

const findDoctor = async (value) => {
  if (!value) {
    return null;
  }

  return Doctor.findOne({
    $or: [
      { slug: value.trim().toLowerCase() },
      { name: new RegExp(`^${escapeRegex(value.trim())}$`, 'i') },
    ],
  });
};

const getOverview = async (req, res, next) => {
  try {
    const [departments, featuredDoctors, departmentCount, doctorCount, appointmentCount] = await Promise.all([
      Department.find().sort({ name: 1 }).lean(),
      Doctor.find({ featured: true })
        .populate('department')
        .sort({ rating: -1, reviewCount: -1, name: 1 })
        .limit(4)
        .lean(),
      Department.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
    ]);

    const stats = [
      {
        label: 'Clinical departments',
        value: `${departmentCount}+`,
      },
      {
        label: 'Consultant doctors',
        value: `${doctorCount}+`,
      },
      {
        label: 'Appointment requests handled',
        value: `${Math.max(appointmentCount, 1200)}+`,
      },
      {
        label: 'Patient satisfaction',
        value: '96%',
      },
    ];

    res.json({
      success: true,
      data: {
        hero: {
          eyebrow: 'Digital-first hospital care platform',
          title: 'Compassionate hospital care, shaped for clarity and speed.',
          description:
            'HealthNexus combines specialist discovery, appointment intake, department guidance, and family-friendly communication into one modern hospital experience.',
          primaryCta: {
            label: 'Book an Appointment',
            href: '/appointments',
          },
          secondaryCta: {
            label: 'Explore Departments',
            href: '/departments',
          },
        },
        stats,
        departments: departments.slice(0, 4),
        featuredDoctors,
        highlights: hospitalHighlights,
        careJourney,
        testimonials,
        faqs,
        quickFacts,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 }).lean();
    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

const getDoctors = async (req, res, next) => {
  try {
    const { department, search, featured, limit } = req.query;
    const query = {};

    if (department) {
      const matchedDepartment = await findDepartment(department);
      if (!matchedDepartment) {
        return res.json({ success: true, data: [] });
      }

      query.department = matchedDepartment._id;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      const safePattern = new RegExp(escapeRegex(search.trim()), 'i');
      query.$or = [
        { name: safePattern },
        { specialty: safePattern },
        { credentials: safePattern },
        { focusAreas: safePattern },
      ];
    }

    const doctorsQuery = Doctor.find(query)
      .populate('department')
      .sort({ featured: -1, rating: -1, reviewCount: -1, name: 1 });

    if (limit) {
      doctorsQuery.limit(Number(limit));
    }

    const doctors = await doctorsQuery.lean();
    return res.json({ success: true, data: doctors });
  } catch (error) {
    return next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      patientType,
      department,
      doctor,
      preferredDate,
      preferredTimeSlot,
      reason,
      notes,
    } = req.body;

    if (!fullName || !email || !phone || !department || !preferredDate || !preferredTimeSlot || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please complete the required appointment details.',
      });
    }

    const selectedDepartment = await findDepartment(department);
    if (!selectedDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Please choose a valid department.',
      });
    }

    let selectedDoctor = null;
    if (doctor) {
      selectedDoctor = await findDoctor(doctor);

      if (!selectedDoctor) {
        return res.status(400).json({
          success: false,
          message: 'The selected doctor could not be found.',
        });
      }

      if (String(selectedDoctor.department) !== String(selectedDepartment._id)) {
        return res.status(400).json({
          success: false,
          message: 'The selected doctor does not belong to that department.',
        });
      }
    }

    const normalizedDate = new Date(preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(normalizedDate.getTime()) || normalizedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid future appointment date.',
      });
    }

    const appointment = await Appointment.create({
      fullName,
      email,
      phone,
      patientType,
      department: selectedDepartment._id,
      doctor: selectedDoctor ? selectedDoctor._id : null,
      preferredDate: normalizedDate,
      preferredTimeSlot,
      reason,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Your appointment request has been received. Our care desk will confirm it shortly.',
      data: {
        id: appointment._id,
        status: appointment.status,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const createContactMessage = async (req, res, next) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in the required contact details.',
      });
    }

    await ContactMessage.create({
      fullName,
      email,
      phone,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: 'Thanks for reaching out. Our support team will get back to you soon.',
    });
  } catch (error) {
    return next(error);
  }
};

const getCareDeskOverview = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const [
      appointments,
      messages,
      pendingAppointments,
      confirmedAppointments,
      newMessages,
      todayRequests,
      departmentLoadRaw,
      departments,
    ] = await Promise.all([
      Appointment.find()
        .populate('department', 'name slug')
        .populate('doctor', 'name specialty')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      ContactMessage.find().sort({ createdAt: -1 }).limit(8).lean(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      ContactMessage.countDocuments({ status: 'new' }),
      Appointment.countDocuments({
        preferredDate: {
          $gte: startOfToday,
          $lt: endOfToday,
        },
      }),
      Appointment.aggregate([
        {
          $group: {
            _id: '$department',
            total: { $sum: 1 },
            pending: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
              },
            },
          },
        },
      ]),
      Department.find().select('_id name').lean(),
    ]);

    const departmentNameMap = departments.reduce((map, department) => {
      map[String(department._id)] = department.name;
      return map;
    }, {});

    const departmentLoad = departmentLoadRaw
      .map((item) => ({
        name: departmentNameMap[String(item._id)] || 'Unknown',
        total: item.total,
        pending: item.pending,
      }))
      .sort((left, right) => right.total - left.total);

    return res.json({
      success: true,
      data: {
        metrics: [
          { label: 'Pending appointments', value: pendingAppointments },
          { label: 'Confirmed appointments', value: confirmedAppointments },
          { label: 'New care-desk messages', value: newMessages },
          { label: 'Requests for today', value: todayRequests },
        ],
        appointments,
        messages,
        departmentLoad,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    if (!appointmentStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid appointment status.',
      });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('department', 'name slug')
      .populate('doctor', 'name specialty');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    appointment.status = status;

    if (typeof notes === 'string') {
      appointment.notes = notes.trim();
    }

    await appointment.save();

    return res.json({
      success: true,
      message: 'Appointment updated successfully.',
      data: appointment,
    });
  } catch (error) {
    return next(error);
  }
};

const updateContactMessageStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!messageStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid message status.',
      });
    }

    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.',
      });
    }

    message.status = status;
    await message.save();

    return res.json({
      success: true,
      message: 'Message updated successfully.',
      data: message,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createAppointment,
  createContactMessage,
  getCareDeskOverview,
  getDepartments,
  getDoctors,
  getOverview,
  updateAppointmentStatus,
  updateContactMessageStatus,
};
