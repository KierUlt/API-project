'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Reviews';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        userId: 2,
        review: 'Being here was such a nostalgic trip, but it smells way worse than I remembered and the water tasted funny',
        stars: 2
      },
      {
        spotId: 2,
        userId: 1,
        review: "Aye, how did I get 'ere again? Was a nice wee nap though",
        stars: 4
      },
      {
        spotId: 3,
        userId: 3,
        review: 'Finished the fight, time to settle down. And what better than here.',
        stars: 5
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};
