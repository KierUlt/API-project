const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { User, Reviews, ReviewImages, Spots, SpotImages } = require('../../db/models');
const router = express.Router();

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

router.post('/', async (req, res) => {

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
