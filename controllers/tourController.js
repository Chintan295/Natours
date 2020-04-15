const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFetures');

exports.aliasTopTours = async(req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingAverage,difficulty';
    next();
};

exports.getAllTours = async(req, res) => {
    try {
        //BUILD QUERY
        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        // EXECUTE THE QUERY
        const tours = await features.query;

        //SEND RESPONSE
        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            results: tours.length,
            data: {
                tours
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'failed',
            message: err
        });
    }
};

exports.getTour = async(req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'failed',
            message: err
        });
    }
};

exports.updateTour = async(req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            status: 'Success',
            data: {
                tour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'failed',
            message: err
        });
    }
};

exports.createTour = async(req, res) => {
    try {
        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'Failed',
            message: err
        });
        //console.log()
    }
};

exports.deleteTour = async(req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'Success',
            data: null
        });
    } catch (err) {
        res.status(400).json({
            status: 'Failed',
            message: err
        });
    }
};

exports.getTourStats = async(req, res) => {
    try {
        const stats = await Tour.aggregate([{
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    // _id: '$ratingsAverage',
                    numRatings: { $sum: '$ratingsQuantity' },
                    numTours: { $sum: 1 },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort: { avgPrice: 1 }
            },
            // {
            //     $match: { _id: { $ne: 'EASY' } }
            // }
            
        ]);
        res.status(200).json({
            status: 'Success',
            stats
        });
    } catch (error) {
        res.status(400).json({
            status: 'Failed',
            message: error
        });
    }
};

exports.getMonthlyPlan= async(req, res) => {
    try{
        const year=req.params.year*1;
        const plan = await Tour.aggregate([
            {
                $unwind:'$startDates'
            },
            {
                $match:{
                    startDates:{
                        $gte:new Date(`${year}-01-01`),
                        $lte:new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group:{
                    _id:{$month:'$startDates'},
                    numTourStart:{$sum:1},
                    tours:{$push:'$name'}

                }
            },
            {
                $addFields:{
                    month:'$_id'
                }
            },
            {
                $project:{_id:0}
            },
            {
                $sort:{numTourStart:-1}
            }
        ]);
        res.status(200).json({
            status: 'Success',
            plan
        });

    }catch(err){
        res.status(400).json({
            status: 'Failed',
            message: err
        });
    }

}