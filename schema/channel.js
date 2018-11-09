export default `
type Channel {
    name: String!
    messages: [Message!]!
    id: Int!
    public: Boolean!
    users: [User!]!
}

type Mutation {
    createChannel(name: String!, teamId: Int!, public: Boolean = false): Boolean!
}

`;
