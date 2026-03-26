const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    qualifications: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      default: 0,
    },
    languages: {
      type: [String],
      default: [],
    },
    available: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    schedule: {
      weekdays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      startTime: {
        type: String,
        default: '09:00',
        trim: true,
      },
      endTime: {
        type: String,
        default: '17:00',
        trim: true,
      },
      slotDurationMinutes: {
        type: Number,
        default: 30,
      },
      consultationMode: {
        type: String,
        default: 'In-person and virtual',
        trim: true,
      },
      notes: {
        type: String,
        default: 'Available for scheduled consultations during posted clinic hours.',
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Doctor', doctorSchema);
