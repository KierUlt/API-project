const express = require('express');
const { requireAuth } = require("../../utils/auth");
const { Spots, SpotImages, Bookings, sequelize } = require('../../db/models');
const router = express.Router();

const doesBookingExist = async (req, res, next) => {
    let { bookingId } = req.params;
    let foundBooking = await Bookings.findByPk(bookingId);
    if(!foundBooking){
        let err = {
            status: 404,
            statusCode: 404,
            message: "Booking couldn't be found"
        }
        return next(err);
    }
    return next();
}

const convertDate = (date) => {
    let [year, month, day] = date.split("-");
    let newDate = new Date(year, month-1, day);
    return newDate;
}

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

router.put('/:bookingId', requireAuth, doesBookingExist, async (req, res, next)=> {
    let { bookingId } = req.params;
    let currentUser = req.user;
    let { startDate, endDate } = req.body;
    let foundBooking = await Bookings.findByPk(bookingId);
    let convertedStartDate = convertDate(startDate);
    let convertedEndDate = convertDate(endDate);
    let currentDate = new Date();

    if(convertedEndDate < currentDate || convertedStartDate <= currentDate){
        let err = {
            status: 403,
            statusCode: 403,
            message: "Past bookings can't be modified"
        }
        return next(err);
    }

    if(convertedEndDate <= convertedStartDate){
        let err = {
            status: 400,
            statusCode: 400,
            message: "Validation error",
            errors: {
                endDate: "endDate cannot come before startDate"
            }
        }
        return next(err);
    }

    let spotId = foundBooking.spotId;
    let foundSpot = await Spots.findByPk(spotId);
    let confirmedBookings = await foundSpot.getBookings();

    confirmedBookings.forEach(booking => {
        if (booking.id !== foundBooking.id){
            let confirmedBooking = booking.toJSON();
            let err = {
                status: 403,
                statusCode: 403,
                message: "Sorry, this spot is already booked for the specified dates",
                errors: {}
            }
            let bookedStart = convertDate(confirmedBooking.startDate);
            let bookedEnd = convertDate(confirmedBooking.endDate);
            if(bookedStart <= convertedStartDate && bookedEnd >= convertedStartDate){
                err.errors.startDate = "Start date conflicts with an existing booking";
                if(bookedEnd >= convertedEndDate && bookedStart <= convertedEndDate){
                    err.errors.endDate = "End date conflicts with an existing booking";
                }
                return next(err);
            }
            if(bookedEnd >= convertedEndDate && bookedStart <= convertedEndDate){
                err.errors.endDate = "End date conflicts with an existing booking";
                if(bookedStart <= convertedStartDate && bookedEnd >= convertedStartDate){
                    err.errors.startDate = "Start date conflicts with an existing booking";
                }
                return next(err);
            }
        }
    })
    foundBooking.startDate = convertedStartDate;
    foundBooking.endDate = convertedEndDate;
    await foundBooking.save();
    res.json(foundBooking);
});

router.delete('/:bookingId', requireAuth, doesBookingExist, async (req, res, next)=> {
    let { bookingId } = req.params;
    let user = req.user;
    let foundBooking = await Bookings.findByPk(bookingId);
    let foundSpot = await foundBooking.getSpot();
    let bookingStartDate = convertDate(foundBooking.startDate);
    let currentDate = new Date();
    if(user.id !== foundSpot.ownerId && user.id !== foundBooking){
        let err = {
            status: 403,
            statusCode: 403,
            message: "Must have authorization to delete booking"
        }
        return next(err);
    }
    if(bookingStartDate <= currentDate){
        let err = {
            status: 403,
            statusCode: 403,
            message: "Bookings that have been started can't be deleted"
        }
        return next(err);
    }
    await foundBooking.destroy()
    res.status(200);
    res.json({message: "Successfully deleted", statusCode: 200})
});
module.exports = router;
