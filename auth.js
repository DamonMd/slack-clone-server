import _ from "lodash";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const createTokens = async (user, secret, secret2) => {
  const createToken = jwt.sign(
    {
      user: _.pick(user, ["id", "username"])
    },
    secret,
    {
      expiresIn: "1h"
    }
  );
  const createRefreshToken = jwt.sign(
    {
      user: _.pick(user, "id")
    },
    secret2,
    {
      expiresIn: "7d"
    }
  );
  return [createToken, createRefreshToken];
};

export const refreshTokens = async (token, refreshToken, SECRET, SECRET2) => {
  let userId = 0;
  try {
    const {
      user: { id }
    } = jwt.decode(refreshToken);
    userId = id;
  } catch (err) {
    return {};
  }
  const user = await models.User.findOne({ where: { id: userId }, raw: true });
  if (!user) {
    return {};
  }
  const refreshTokenSecret = user.password + SECRET2;
  try {
    jwt.verify(refreshToken, refreshTokenSecret);
  } catch (err) {
    return {};
  }
  const [newToken, newRefreshToken] = await createTokens(
    user,
    SECRET,
    refreshTokenSecret
  );
  return {
    token: newToken,
    refreshToken: newRefreshToken,
    user
  };
};

export const tryLogin = async (email, password, models, SECRET, SECRET2) => {
  const user = await models.User.findOne({ where: { email }, raw: true });
  if (!user) {
    return {
      ok: false,
      errors: [{ path: "email", message: "Email not found" }]
    };
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return {
      ok: false,
      errors: [
        {
          path: "password",
          message: "Password does not match for the email provided"
        }
      ]
    };
  }
  const [token, refreshToken] = await createTokens(
    user,
    SECRET,
    SECRET2,
    user.refreshSecret
  );
  return {
    ok: true,
    token,
    refreshToken
  };
};
