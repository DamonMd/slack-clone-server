export default (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    username: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isAlphanumeric: {
          args: true,
          msg: " The username can only contain letters and numbers!"
        },
        len: {
          args: [3, 15],
          msg: "Username must be between 3 and 15 characters"
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: {
          args: true,
          msg: "Invalid Email"
        }
      }
    },
    password: {
      type: DataTypes.STRING
    }
    // email: DataTypes.STRING,
    // password: DataTypes.STRING
  });

  User.associate = models => {
    User.belongsToMany(models.Team, {
      through: "member",
      foreignKey: {
        name: "userId",
        field: "user_id"
      }
    });
    //N to Many
    User.belongsToMany(models.Channel, {
      through: "channel_member",
      foreignKey: {
        name: "userId",
        field: "user_id"
      }
    });
  };

  return User;
};
