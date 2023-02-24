const express = require('express');
const { Bookings } = require('../../db/models');
const router = express.Router();

router.get('/current', async (req, res) => {
    return res.json('Dummy route');
});

router.put('/:bookingId', async (req, res)=> {

});

router.delete('/:bookingId', async (req, res)=> {

});
module.exports = router;
