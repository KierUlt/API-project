const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { ReviewImages, sequelize } = require('../../db/models');
const router = express.Router();

router.delete('/:imageId', requireAuth, async (req, res, next) => {
    let { imageId } = req.params;
    let user = req.user;
    let img = await ReviewImages.findByPk(imageId);
    if(!img){
        let err = {
            status: 404,
            statusCode: 404,
            message: "Review Image couldn't be found"
        }
        return next(err);
    }
    let review = await img.getReview();
    if(user.id !== review.userId){
        let err = {
            status: 403,
            statusCode: 403,
            message: "You do not have proper authorization to delete the image"
        }
        return next(err);
    }
    await img.destroy();
    res.json({message: "Successfully deleted", statusCode: 200})
});


module.exports = router;
