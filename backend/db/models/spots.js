'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spots extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Spots.belongsTo(
        models.User,
        { foreignKey: 'ownerId'}
      );
      Spots.hasMany(
        models.Bookings,
        { foreignKey: 'spotId', onDelete: 'CASCADE'}
      );
      Spots.hasMany(
        models.Reviews,
        { foreignKey: 'spotId', onDelete: 'CASCADE'}
      );
      Spots.hasMany(
        models.SpotImages,
        { foreignKey: 'spotId', onDelete: 'CASCADE'}
      );
    }
  }
  Spots.init({
    ownerId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    address: {
      allowNull: false,
      type: DataTypes.STRING(30)
    },
    city: {
      allowNull: false,
      type: DataTypes.STRING(30)
    },
    state: {
      allowNull: false,
      type: DataTypes.STRING(30)
    },
    country: {
      allowNull: false,
      type: DataTypes.STRING(30)
    },
    lat: {
      allowNull: false,
      type: DataTypes.DECIMAL
    },
    lng: {
      allowNull: false,
      type: DataTypes.DECIMAL
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(30)
    },
    description: {
      allowNull: false,
      type: DataTypes.STRING(1000)
    },
    price: {
      allowNull: false,
      type: DataTypes.DECIMAL
    }
  }, {
    sequelize,
    modelName: 'Spots',
  });
  return Spots;
};
