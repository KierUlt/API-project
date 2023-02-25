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

router.get('/current', async (req, res) => {

});

router.get('/:spotId', async (req, res) => {

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
