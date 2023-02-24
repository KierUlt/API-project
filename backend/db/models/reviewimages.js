'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReviewImages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ReviewImages.belongsTo(
        models.Reviews,
        { foreignKey: 'reviewId'}
      )
    }
  }
  ReviewImages.init({
    reviewId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    url: {
      allowNull: false,
      type: DataTypes.STRING(255)
    }
  }, {
    sequelize,
    modelName: 'ReviewImages',
  });
  return ReviewImages;
};
