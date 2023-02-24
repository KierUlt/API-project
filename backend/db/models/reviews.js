'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reviews extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Reviews.belongsTo(
        models.User,
        { foreignKey: 'userId'}
      );
      Reviews.belongsTo(
        models.Spots,
        { foreignKey: 'spotId'}
      );
      Reviews.hasMany(
        models.ReviewImages,
        { foreignKey: 'reviewId', onDelete: 'CASCADE'}
      );
    }
  }
  Reviews.init({
    spotId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    userId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    review: {
      allowNull: false,
      type: DataTypes.STRING(255)
    },
    stars: {
      allowNull: false,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 5
      }
    }
  }, {
    sequelize,
    modelName: 'Reviews',
  });
  return Reviews;
};
