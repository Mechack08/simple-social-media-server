"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.User.belongsToMany(models.Message, {
        through: models.Like,
        foreignKey: "userId",
        otherKey: "messageId",
      });

      models.Message.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: "messageId",
        otherKey: "userId",
      });

      models.User.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      models.Message.belongsTo(models.Message, {
        foreignKey: "messageId",
        as: "message",
      });
    }
  }
  Like.init(
    {
      messageId: {
        Type: DataTypes.INTEGER,
        references: {
          model: "Message",
          key: "id",
        },
      },
      userId: {
        Type: DataTypes.INTEGER,
        references: {
          model: "User",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Like",
    }
  );
  return Like;
};