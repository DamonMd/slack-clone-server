import formatErrors from "../formatErrors";
import requiresAuth from "../permissions";

export default {
  Query: {
    allTeams: async (parent, args, { models, user }) => {
      //fetch all teams where the user id is the owner
      const teams = await models.Team.findAll(
        { where: { owner: user.id } },
        { raw: true }
      );
      // const teams = await models.Team.findAll();
      console.log("teams", teams);
      return teams;
    }
  },
  Mutation: {
    createTeam: requiresAuth.createResolver(
      async (parent, { name }, { models, user }) => {
        try {
          if (name.length < 3 || name.length > 20) {
            return {
              ok: false,
              errors: [
                {
                  path: "name",
                  message:
                    "name must be longer than 2 and less than 20 characters"
                }
              ]
            };
          } else {
            const team = await models.Team.create({ name, owner: user.id });
            return { ok: true };
          }
        } catch (err) {
          console.log(err);
          return {
            ok: false,
            errors: formatErrors(err)
          };
        }
      }
    )
  },
  Team: {
    channels: ({ id }, args, { models }) =>
      models.Channel.findAll({ where: { teamId: id } })
  }
};
