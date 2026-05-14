import mongoose from 'mongoose';

const vector3Schema = new mongoose.Schema(
  {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
  },
  { _id: false }
);

const interactionStateSchema = new mongoose.Schema(
  {
    cameraPosition: { type: vector3Schema, default: () => ({ x: 5, y: 5, z: 5 }) },
    cameraTarget: { type: vector3Schema, default: () => ({ x: 0, y: 0, z: 0 }) },
    zoom: { type: Number, default: 1 },
    objectRotation: { type: vector3Schema, default: () => ({ x: 0, y: 0, z: 0 }) },
    wireframe: { type: Boolean, default: false },
    autoRotate: { type: Boolean, default: false },
  },
  { _id: false }
);

const modelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    s3Url: {
      type: String,
      required: [true, 'File URL is required'],
    },
    s3Key: {
      type: String,
      required: true,
    },
    storageType: {
      type: String,
      enum: ['s3', 'local'],
      default: 'local',
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    interactionState: {
      type: interactionStateSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for efficient user-specific queries
modelSchema.index({ userId: 1, uploadDate: -1 });

const Model = mongoose.model('Model', modelSchema);
export default Model;
