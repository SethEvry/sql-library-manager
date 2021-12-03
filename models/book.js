'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "The book needs a title!"
        },
        notEmpty: {
          msg: "The book needs a title!"
        }
      }
    },
    author:{
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "The book needs an author!"
        },
        notEmpty: {
          msg: "The book needs an author!"
        }
      }
    },
    genre: DataTypes.STRING,
    year: {
      type:DataTypes.INTEGER,
      validate: {
        isInt: {
          msg: "Year must be a valid Integer!"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};