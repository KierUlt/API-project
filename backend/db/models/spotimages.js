'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SpotImages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SpotImages.belongsTo(
        models.Spots,
        { foreignKey: 'spotId', onDelete: 'CASCADE'}
      )
    }
  }
  SpotImages.init({
    spotId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    url: {
      allowNull: false,
      type: DataTypes.STRING
    },
    preview: {
      type: DataTypes.BOOLEAN
    }
  }, {
    sequelize,
    modelName: 'SpotImages',
  });
  return SpotImages;
};
