const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  patientName: {
    type: String,
    required: true,
    trim: true,
  },
  patientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  patientPhone: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  doctor: {
    type: String,
    required: true,
    trim: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null,
  },
  preferredDate: {
    type: String,
    required: true,
    trim: true,
  },
  preferredTime: {
    type: String,
    required: true,
    trim: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  notes: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
