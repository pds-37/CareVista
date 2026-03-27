export const roleOptions = [
  {
    key: 'patient',
    label: 'Patient',
    eyebrow: 'Patient Access',
    title: 'Manage appointments and health updates',
    description:
      'Book appointments, track request statuses, and keep your visit history in one secure place.',
  },
  {
    key: 'doctor',
    label: 'Doctor',
    eyebrow: 'Doctor Access',
    title: 'Review schedules and assigned patients',
    description:
      'Access your clinical dashboard, update appointment statuses, and manage availability.',
  },
  {
    key: 'admin',
    label: 'Admin',
    eyebrow: 'Admin Access',
    title: 'Oversee the full HealthNexus system',
    description:
      'Monitor users, departments, messages, appointments, and doctor accounts from one control center.',
  },
];

export const getPortalPathForRole = (role) => {
  if (role === 'admin') {
    return '/portal/admin';
  }

  if (role === 'doctor') {
    return '/portal/doctor';
  }

  return '/portal/patient';
};

