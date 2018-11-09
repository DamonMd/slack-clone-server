const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const query = require("qs-middleware");

import { makeExecutableSchema } from "graphql-tools";
import models from "./models";
import path from "path";
import { fileLoader, mergeTypes, mergeResolvers } from "merge-graphql-schemas";
import cors from "cors";
import jwt from "jsonwebtoken";
import { refreshTokens } from "./auth";

const types = fileLoader(path.join(__dirname, "./schema"));
const typeDefs = mergeTypes(types, { all: true });

const res = fileLoader(path.join(__dirname, "./resolvers"));
const resolvers = mergeResolvers(res, { all: true });

const SECRET = "puppymonkeybaby";
const SECRET2 = "ofjaioghogahe";
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    console.log("token from context area", req.headers.xtoken);
    return { models, user: req.user, SECRET, SECRET2 };
  }
});

const app = express();

const addUser = async (req, res, next) => {
  const token = req.headers.xtoken;
  if (token) {
    try {
      const { user } = jwt.verify(token, SECRET);
      console.log("user from jwt", user);
      req.user = user;
    } catch (err) {
      const refreshToken = req.headers.xRefresh;
      const newTokens = await refreshTokens(
        token,
        refreshToken,
        models,
        SECRET,
        SECRET2
      );
      if (newTokens.token && newTokens.refreshToken) {
        res.set("Access-Control-Expose-Headers", "xToken, xRefresh");
        res.set("xToken", newTokens.token);
        res.set("xRefresh", newTokens.refreshToken);
      }
      req.user = newTokens.user;
    }
  }
  next();
};

app.use(cors("*"));
app.use(addUser);
server.applyMiddleware({ app });

models.sequelize.sync().then(() => {
  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
});

// app.listen({ port: 4000 }, () =>
//   console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
// );
