export default `
type Message {
    id: Int!
    text: String!
    user: User!
    channel: Channel!
}

type Mutation {
    createMessage(text: String!, channelId: Int!): Boolean!
}

`;
