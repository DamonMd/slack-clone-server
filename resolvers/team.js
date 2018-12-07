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
      return teams;
    }
  },
  Mutation: {
    createTeam: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        console.log("name??", args);
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
            const team = await models.Team.create({ ...args, owner: user.id });
            //channels belong to a team. find associated channels by passing a team's id i.e. the foreign key
            await models.Channel.create({
              name: "general",
              public: true,
              teamId: team.id
            });
            return { ok: true, team };
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
