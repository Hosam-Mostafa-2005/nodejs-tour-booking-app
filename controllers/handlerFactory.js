import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';
import APIFeatures from '../utils/apiFeatures.js';

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after', // بدل new: true
      runValidators: true,
    });
    if (!doc) {
      const err = new Error('No tour found with that ID');
      err.statusCode = 404;
      err.status = 'fail';
      return next(err);
    }

    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { tour: doc },
    });
  });

export const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const ID = req.params.id;

    // 🔥 الحل هنا
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError(`Invalid ID format: ${ID}`, 400));
    }

    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No tour found with this ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tours(hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const queryParams = req.queryData || req.query;

    const features = new APIFeatures(Model.find(filter), queryParams)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { doc },
    });
  });
