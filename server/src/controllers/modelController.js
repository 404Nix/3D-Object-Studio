import Model from '../models/Model.js';
import uploadService from '../services/uploadService.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Upload a 3D model (.glb)
 * @route   POST /api/models/upload
 * @access  Private
 */
export const uploadModel = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded. Please select a .glb file.', 400);
    }

    // Upload file
    const { url, key, storageType } = await uploadService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Save metadata to DB
    const model = await Model.create({
      userId: req.user._id,
      fileName: key,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      s3Url: url,
      s3Key: key,
      storageType,
    });

    res.status(201).json({
      success: true,
      message: 'Model uploaded successfully',
      data: { model },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all models for the authenticated user
 * @route   GET /api/models
 * @access  Private
 */
export const getModels = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [models, total] = await Promise.all([
      Model.find({ userId: req.user._id })
        .sort({ uploadDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Model.countDocuments({ userId: req.user._id }),
    ]);

    res.json({
      success: true,
      data: {
        models,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single model by ID
 * @route   GET /api/models/:id
 * @access  Private
 */
export const getModelById = async (req, res, next) => {
  try {
    const model = await Model.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!model) {
      throw new AppError('Model not found', 404);
    }

    res.json({
      success: true,
      data: { model },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a model
 * @route   DELETE /api/models/:id
 * @access  Private
 */
export const deleteModel = async (req, res, next) => {
  try {
    const model = await Model.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!model) {
      throw new AppError('Model not found', 404);
    }

    // Delete file from storage
    await uploadService.deleteFile(model.s3Key, model.storageType);

    // Delete from DB
    await Model.findByIdAndDelete(model._id);

    res.json({
      success: true,
      message: 'Model deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save interaction state for a model
 * @route   POST /api/models/:id/state
 * @access  Private
 */
export const saveState = async (req, res, next) => {
  try {
    const { cameraPosition, cameraTarget, zoom, objectRotation, wireframe, autoRotate } = req.body;

    const model = await Model.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!model) {
      throw new AppError('Model not found', 404);
    }

    // Update interaction state
    model.interactionState = {
      cameraPosition: cameraPosition || model.interactionState.cameraPosition,
      cameraTarget: cameraTarget || model.interactionState.cameraTarget,
      zoom: zoom ?? model.interactionState.zoom,
      objectRotation: objectRotation || model.interactionState.objectRotation,
      wireframe: wireframe ?? model.interactionState.wireframe,
      autoRotate: autoRotate ?? model.interactionState.autoRotate,
    };

    await model.save();

    res.json({
      success: true,
      message: 'State saved',
      data: { interactionState: model.interactionState },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get interaction state for a model
 * @route   GET /api/models/:id/state
 * @access  Private
 */
export const getState = async (req, res, next) => {
  try {
    const model = await Model.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select('interactionState');

    if (!model) {
      throw new AppError('Model not found', 404);
    }

    res.json({
      success: true,
      data: { interactionState: model.interactionState },
    });
  } catch (error) {
    next(error);
  }
};
