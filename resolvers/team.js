import formatErrors from "../formatErrors";
import requiresAuth from "../permissions";

export default {
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
  }
};
