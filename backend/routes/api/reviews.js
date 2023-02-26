const express = require('express');
const { requireAuth } = require("../../utils/auth");
const { Reviews, Spots, User, SpotImages, ReviewImages, sequelize } = require('../../db/models');
const router = express.Router();

router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;
    const userReviews = await Reviews.findAll({
        where: {
            userId: user.id
        },
        include: [
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: Spots,
                attributes: {
                    exclude: ['description', 'createdAt', 'updatedAt']
                },
                include: [
                    {
                        model: SpotImages,
                        attributes: ['preview', 'url']
                    }
                ]
            },
            {
                model: ReviewImages,
                attributes: ['id', 'url']
            }
        ]
    })
    if(userReviews.length <= 0) return res.json({message: "No reviews found"});
    let foundReviews = [];
    userReviews.forEach(review => {
        review = review.toJSON();
        if(review.Spot.SpotImages.length > 0){
            for(let prev in review.Spot.SpotImages){
                console.log(review.Spot.SpotImages[prev])
                if(review.Spot.SpotImages[prev].preview) review.Spot.previewImage = review.Spot.SpotImages[prev].url
            }
        } else review.Spot.previewImage = "No preview image found";
        if(review.ReviewImages.length <= 0) review.ReviewImages = "No review image found";
        delete review.Spot.SpotImages;
        foundReviews.push(review);
    });
    let pushedReviews = { Reviews: foundReviews };
    res.json(pushedReviews);
});

router.post('/:reviewId/images', async (req, res) => {

});

router.put('/:reviewId', async (req, res) => {

});

router.delete('/:reviewId', async (req, res) => {

});

module.exports = router;
