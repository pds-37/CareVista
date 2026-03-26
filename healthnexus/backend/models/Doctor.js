const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    credentials: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      required: true,
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      required: true,
      min: 0,
    },
    languages: {
      type: [String],
      default: [],
    },
    availability: {
      type: [String],
      default: [],
    },
    focusAreas: {
      type: [String],
      default: [],
    },
    education: {
      type: [String],
      default: [],
    },
    avatarColor: {
      type: String,
      default: '#1c6e74',
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Doctor', doctorSchema);
