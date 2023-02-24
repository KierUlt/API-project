'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}


module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Spots';
    return queryInterface.bulkInsert(options, [
      {
        ownerId: 1,
        address: '800 M Bridge',
        city: 'Teufort',
        state: 'New Mexico',
        country: 'United States',
        lat: 32.410065473693386,
        lng: -108.76041818077549,
        name: '2fort Milling',
        description: "Originally named 'Hugginsville', was founded in 1847 by Claude Huggins, lone survivor of a bear attack, who went on to settle the town directly on top of his wife's skeleton. Later that year, a wandering pack of teenage bullies forced Huggins to rename the town to 'Two Farts', after which he was too afraid to restore its name, and renamed the town to 'Teufort' instead.",
        price: 10.00
      },
      {
        ownerId: 2,
        address: 'Samseong-dong, Teheran-ro, 521',
        city: 'Seoul',
        state: 'Gangnam-gu',
        country: 'South Korea',
        lat: 37.509548433170124,
        lng: 127.06120914044887,
        name: 'Riot Korea',
        description: 'Riot Korea HQ, leading LoL eSports from the highest tower in Seoul',
        price: 500.00
      }, {
        ownerId: 3,
        address: 'NM 105 E',
        city: 'New Mombasa',
        state: 'Mombasa',
        country: 'Kenya',
        lat: -4.061769650648552,
        lng: 39.667677287444796,
        name: 'Vyrant Telecom Tower',
        description: 'Overlooking the beautiful New Mombasa cityscape, and neighbors the newly built Space Elevator',
        price: 10000.00
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      address: { [Op.in]: ['800 M Bridge', 'Samseong-dong, Teheran-ro, 521', 'NM 105 E'] }
    }, {});
  }
};
