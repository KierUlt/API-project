const express = require('express');
const { requireAuth } = require("../../utils/auth");
const { Spots, SpotImages, Bookings, sequelize } = require('../../db/models');
const router = express.Router();

router.get('/current', requireAuth, async (req, res) => {
    let { user } = req;
    let userBookings = await Bookings.findAll({
        where: {
            userId: user.id
        },
        include: [
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
            }
        ]
    });
    let foundBookings = [];
    if(userBookings<=0) return res.json({message: "No user bookings found"});
    userBookings.forEach(booking => {
        booking = booking.toJSON();
        if(booking.Spot.SpotImages.length > 0){
            for(let book in booking.Spot.SpotImages){
                if (booking.Spot.SpotImages[book].preview === true) booking.Spot.SpotImages[book].url;
            }
        }
        if(!booking.Spot.previewImage) booking.Spot.previewImage = "No image available";
        delete booking.Spot.SpotImages;
        foundBookings.push(booking);
    });
    let foundBookingsObj = { Bookings: foundBookings };
    return res.json(foundBookingsObj);
});

router.put('/:bookingId', async (req, res)=> {

});

router.delete('/:bookingId', async (req, res)=> {

});
module.exports = router;
