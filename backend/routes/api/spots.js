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

router.post('/:spotId/images', async (req, res) => {

});

router.post('/:spotId/reviews', async (req, res) => {

});

router.post('/:spotId/bookings', async (req, res) => {

});

router.put('/:spotId', async (req, res) => {

});

router.delete('/:spotId', async (req, res) => {

});

module.exports = router;
