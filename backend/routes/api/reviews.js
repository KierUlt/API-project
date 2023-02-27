const express = require('express');
const { check } = require('express-validator');
const { requireAuth } = require("../../utils/auth");
const { Reviews, Spots, User, SpotImages, ReviewImages, sequelize } = require('../../db/models');
const router = express.Router();
const { handleValidationErrors } = require('../../utils/validation');

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

router.post('/:reviewId/images', requireAuth, async (req, res, next) => {
    let { user } = req;
    let reviewId = req.params.reviewId;
    let { url } = req.body;

    let foundReview = await Reviews.findByPk(reviewId);

    if(!foundReview){
        let err = {};
        err.status = 404;
        err.statusCode = 404;
        err.message = "Review couldn't be found";
        return next(err);
    }
    if(user.id !== foundReview.userId){
        let err = {};
        err.status = 404;
        err.statusCode = 404;
        err.message = "Not authorized user";
        return next(err);
    }
    let newReviewImage = await foundReview.createReviewImage({ url });
    let idReviewImage = { id: newReviewImage.id, url: newReviewImage.url}
    res.json(idReviewImage)
});

router.put('/:reviewId', requireAuth, validateReview, async (req, res, next) => {
    let { reviewId } = req.params;
    let user = req.user
    let { stars, review } = req.body
    let foundReview = await Reviews.findByPk(reviewId);
    if(!foundReview){
        let err = {};
        err.status = 404;
        err.message = "Review couldn't be found";
        return next(err);
    }
    if(user.id !== foundReview.userId){
        let err = {};
        err.status = 403;
        err.message = "Not authorized user";
        return next(err);
    }
    foundReview.stars = stars;
    foundReview.review = review;
    await foundReview.save();
    res.json(foundReview);
});

router.delete('/:reviewId', async (req, res, next) => {
    let { reviewId } = req.params;
    let user = req.user;
    let foundReview = await Reviews.findByPk(reviewId);
    if(!foundReview){
        let err = {};
        err.status = 404;
        err.message = "Review couldn't be found";
        return next(err);
    }
    if(user.id !== foundReview.userId){
        let err = {};
        err.status = 403;
        err.message = "Not authorized user";
        return next(err);
    }
    await foundReview.destroy();
    res.json({message: "Successfully deleted", statusCode: 200})
});

module.exports = router;
