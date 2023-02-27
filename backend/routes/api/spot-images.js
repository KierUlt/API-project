const express = require('express');
const { requireAuth } = require("../../utils/auth")
const { SpotImages, Spots, sequelize } = require('../../db/models');
const router = express.Router();

router.delete('/:imageId', requireAuth, async (req, res, next) => {
    let { user } = req;
    let imgId = req.params.imageId;
    let imgToDelete = await SpotImages.findByPk(imgId, {
        include: [
            {
                model: Spots
            }
        ]
    });

    if(!imgToDelete){
        let err = {
            status: 404,
            statusCode: 404,
            message: "Spot Image couldn't be found"
        }
        return next(err);
    }
    if(imgToDelete.Spot.ownerId !== user.id){
        let err = {
            status: 403,
            statusCode: 403,
            message: "You do not have proper authorization to delete the image"
        }
        return next(err);
    }
    await imgToDelete.destroy();
    res.status(200);
    res.json({message: "Successfully deleted", statusCode: 200})
});

module.exports = router;
