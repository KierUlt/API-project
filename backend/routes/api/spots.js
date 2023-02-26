const express = require('express');
const { check } = require('express-validator');
const { requireAuth } = require('../../utils/auth');
const { User, Reviews, ReviewImages, Spots, SpotImages, sequelize } = require('../../db/models');
const router = express.Router();
const { handleValidationErrors } = require('../../utils/validation');

const validateSpot = [
    check("address")
        .notEmpty()
        .withMessage("Street address is required"),
    check("city")
        .notEmpty()
        .withMessage("City is required"),
    check("state")
        .notEmpty()
        .withMessage("State is required"),
    check("country")
        .notEmpty()
        .withMessage("Country is required"),
    check("lat", "Must enter a latitude")
        .notEmpty()
        .bail()
        .isDecimal(),
    check("lng", "Must enter a longtitude")
        .notEmpty()
        .bail()
        .isDecimal(),
    check("name", "Name is required")
        .notEmpty()
        .isLength({ max: 50 })
        .withMessage("Name must be less than 50 characters"),
    check("description")
        .notEmpty()
        .withMessage("Description is required"),
    check("price", "Price per day is required")
        .notEmpty()
        .bail()
        .isInt({min: 1})
        .withMessage("Price cannot be less than 1"),
    handleValidationErrors
];
const validateSpotImage = [
    check('url')
        .notEmpty()
        .withMessage('url must be defined'),
    check('preview')
        .notEmpty()
        .isBoolean()
        .withMessage('Preview must be a boolean value'),
    handleValidationErrors
];
const validateReview = [
    check("review")
        .notEmpty()
        .withMessage("Review text is required"),
    check("stars", "Stars must be an integer from 1 to 5")
        .notEmpty()
        .bail()
        .isInt({ min: 0, max: 5 }),
    handleValidationErrors
];
const spotBelongsToUser = async (req, res, next) => {
    let { spotId } = req.params;
    // console.log(spotId)
    const spotDetails = await Spots.findByPk(spotId);
    // console.log(spotDetails)
    const user = req.user;
    if(!spotDetails){
        let err = {};
        err.status = 404;
        err.message = "Spot couldn't be found"
        return next(err);
    }
    if (user.id !== spotDetails.ownerId) {
        let err = {};
        err.title = "Authorization error";
        err.status = 403;
        err.message = "You are not the authorized owner for this spot";
        return next(err);
    };
    return next();
};
router.get('/', async (req, res) => {
    let result = {}
    result.allSpots = await Spots.findAll({
        include: [
            {
                model: Reviews,
                attributes: ['stars'],
            },
            {
                model: SpotImages,
                attributes: ['url', 'preview']
            }
        ]
    });

    let spotsFound = [];

    result.allSpots.forEach(spot => {
        let totalReviews = spot.Reviews.length;
        let sum = 0;

        spot.Reviews.forEach(review => {
            sum += review.stars;
        })

        spot.avgRating = sum / totalReviews;

        spot.SpotImages.forEach(img => {
            if(img.preview) spot.previewImage = img.url;
            else spot.previewImage = "No image found"
        })
        const newSpot = {
            id: spot.id,
            ownerId: spot.ownerId,
            address: spot.address,
            city: spot.city,
            state: spot.state,
            country: spot.state,
            lat: spot.lat,
            lng: spot.lng,
            name: spot.name,
            description: spot.description,
            price: spot.price,
            createdAt: spot.createdAt,
            updatedAt: spot.updatedAt,
            avgRating: spot.avgRating,
            previewImage: spot.previewImage
        }
        spotsFound.push(newSpot);
    })
    res.status(200).json(spotsFound);
});

router.get('/current', requireAuth, async (req, res) => {
    let currentUser = req.user;
    const ownedSpots = await Spots.findAll({
        where: {
            ownerId: currentUser.id
        },
        include: [
            {
                model: Reviews,
                attributes: ['stars']
            },
            {
                model: SpotImages,
                attributes: ['url', 'preview']
            }
        ]
    });
    let spotsFound = [];

    ownedSpots.forEach(spot => {
        let totalReviews = spot.Reviews.length;
        let sum = 0;

        spot.Reviews.forEach(review => {
            sum += review.stars;
        })

        spot.avgRating = sum / totalReviews;

        spot.SpotImages.forEach(img => {
            if(img.preview) spot.previewImage = img.url;
            else spot.previewImage = "No image found"
        })
        const newSpot = {
            id: spot.id,
            ownerId: spot.ownerId,
            address: spot.address,
            city: spot.city,
            state: spot.state,
            country: spot.state,
            lat: spot.lat,
            lng: spot.lng,
            name: spot.name,
            description: spot.description,
            price: spot.price,
            createdAt: spot.createdAt,
            updatedAt: spot.updatedAt,
            avgRating: spot.avgRating,
            previewImage: spot.previewImage
        }
        spotsFound.push(newSpot);
    })
    res.status(200).json(spotsFound);
});

router.get('/:spotId', async (req, res, next) => {
    let spotId = req.params.spotId;
    let foundSpot = await Spots.findByPk(spotId);

    if(!foundSpot){
        const err = {};
        err.status = 404;
        err.statusCode = 404;
        err.title = 'Not found';
        err.message = "Spot couldn't be found";
        return next(err);
    }
    foundSpot = foundSpot.toJSON();
    const reviewCount = await Reviews.count({
        where: {
            spotId: spotId
        }
    });

    foundSpot.numReviews = reviewCount;
    const sum = await Reviews.sum('stars',{
        where: {
            spotId: spotId
        }
    });

    foundSpot.avgStarRatig = sum / reviewCount;

    const spotImgList = await SpotImages.findAll({
        where: {
            spotId: spotId
        },
        attributes: ['id', 'url', 'preview']
    });

    foundSpot.SpotImages = spotImgList;

    foundSpot.Owner = await User.findByPk(foundSpot.ownerId, {
        attributes: {
            exclude: ['username']
        }
    });

    res.json(foundSpot);
});

router.get('/:spotId/reviews', async (req, res) => {
    const { spotId } = req.params;
    const spotDetails = await Spots.findByPk(spotId);
    if(!spotDetails){
        res.status(404);
        return res.json({message: "Spot couldn't be found", statusCode: 404});
    }
    const reviews = await spotDetails.getReviews({
        include: [
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: ReviewImages,
                attributes: ['id', 'url']
            }
        ]
    })
    if(reviews.length <= 0) return res.json("No reviews found");
    let foundReviews = [];
    reviews.forEach(review => {
        let foundReview = review.toJSON();
        if(foundReview.ReviewImages.length <= 0) foundReview.ReviewImages = "No review images found";
        foundReviews.push(foundReview)
    });
    res.json({ Reviews: foundReviews});
});

router.get('/:spotId/bookings', async (req, res) => {

});

router.post('/', validateSpot, requireAuth, async (req, res) => {
    let currentUser = req.user;
    const newSpot = req.body;
    newSpot.ownerId = currentUser.id;
    const newSpotFinal = await Spots.create(newSpot);
    res.status(201);
    return res.json(newSpotFinal);
});

router.post('/:spotId/images', requireAuth, validateSpotImage, spotBelongsToUser,  async (req, res, next) => {
    let { spotId } = req.params;
    let { url, preview } = req.body;
    const spotDetails = await Spots.findByPk(spotId);
    if(!spotDetails){
        let err = {};
        err.status = 404;
        //err.title = "Spot not found";
        err.message = "Spot could not be found";
        return next(err);
    }

    let spotImg = await spotDetails.createSpotImage({
        spotId: spotId,
        url: url,
        preview: preview
    });

    res.json({id: spotImg.id, url: spotImg.url, preview: spotImg.preview});
});

router.post('/:spotId/reviews', requireAuth, validateReview, async (req, res, next) => {
    let { user } = req;
    let { spotId } = req.params;
    let { review, stars } = req.body;
    let foundSpot = await Spots.findByPk(spotId);
    let userReview = await Reviews.findOne({
        where: {
            userId: user.id,
            spotId: spotId
        }
    });
    if(!foundSpot){
        let err = {};
        err.status = 404;
        //err.title = "Spot not found";
        err.message = "Spot could not be found";
        return next(err);
    }
    if(userReview){
        let err = {};
        err.status = 403;
        err.statusCode = 404;
        err.message = "User review already exists";
        return next(err);
    }
    let makeReview = await user.createReview({ spotId, review, stars})
    res.status(201);
    res.json(makeReview);
});

router.post('/:spotId/bookings', async (req, res) => {

});

router.put('/:spotId', requireAuth, validateSpot, spotBelongsToUser, async (req, res, next) => {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    const spotId = req.params.spotId;
    const editSpot = await Spots.findByPk(spotId);
    editSpot.address = address;
    editSpot.city = city;
    editSpot.state = state;
    editSpot.country = country;
    editSpot.lat = lat;
    editSpot.lng = lng;
    editSpot.name = name;
    editSpot.description = description;
    editSpot.price = price;
    await editSpot.save();
    res.json(editSpot);
});

router.delete('/:spotId', requireAuth, spotBelongsToUser, async (req, res) => {
    const { spotId } = req.params;
    const deleteSpot = await Spots.findByPk(spotId);
    console.log(spotId);
    await deleteSpot.destroy();
    res.json({"message": "Successfully deleted", "statusCode": 200});
    //SQLITE constraint error not sure how to fix
});

module.exports = router;
