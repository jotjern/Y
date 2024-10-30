# Backend for Y

An Appollo Express backend, with MongoDB as database

## Table of Contents

- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [GraphQL API](#graphql-api)
  - [Queries](#queries)
  - [Mutations](#mutations)
  - [Resolvers](#resolvers)
- [Authentication](#authentication)
- [Contributing](#contributing)

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Access to NTNU's network

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Configure Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Running the server

Start the development server with:
npm run start:dev

# graphql-api

## Queries

### `getPosts(page: Int!): [Post!]!`

Fetches a paginated list of the latest posts.

- **Parameters:**
  - `page` (Int!): The page number to retrieve.
- **Returns:** An array of `Post` objects.

---

### `getPost(id: ID!): Post`

Retrieves a single post by its ID.

- **Parameters:**
  - `id` (ID!): The unique identifier of the post.
- **Returns:** A `Post` object.

---

### `getComments(postID: ID!): [Comment!]!`

Fetches comments associated with a specific post.

- **Parameters:**
  - `postID` (ID!): The ID of the parent post.
- **Returns:** An array of `Comment` objects.

---

### `getUser(username: String!): User`

Retrieves a user by their username.

- **Parameters:**
  - `username` (String!): The username of the user.
- **Returns:** A `User` object.

---

### `searchAll(query: String!): [SearchResult!]!`

Searches for posts and users matching the query.

- **Parameters:**
  - `query` (String!): The search term.
- **Returns:** An array of `SearchResult` union types (`User` or `Post`).

---

### `searchUsers(query: String!): [User!]!`

Searches for users matching the query.

- **Parameters:**
  - `query` (String!): The search term.
- **Returns:** An array of `User` objects.

---

### `getPostsByIds(ids: [ID!]!): [Post!]!`

Retrieves multiple posts by their IDs.

- **Parameters:**
  - `ids` ([ID!]!): An array of post IDs.
- **Returns:** An array of `Post` objects.

---

### `getCommentsByIds(ids: [ID!]!): [Comment!]!`

Retrieves multiple comments by their IDs.

- **Parameters:**
  - `ids` ([ID!]!): An array of comment IDs.
- **Returns:** An array of `Comment` objects.

---

## Mutations

### `createPost(body: String!): Post!`

Creates a new post.

- **Parameters:**
  - `body` (String!): The content of the post.
- **Requires Authentication:** Yes
- **Returns:** The created `Post` object.

---

### `createComment(body: String!, parentID: ID!): Comment!`

Creates a new comment on a post.

- **Parameters:**
  - `body` (String!): The content of the comment.
  - `parentID` (ID!): The ID of the parent post.
- **Requires Authentication:** Yes
- **Returns:** The created `Comment` object.

---

### `deletePost(id: ID!): Post!`

Deletes a post and all associated comments.

- **Parameters:**
  - `id` (ID!): The ID of the post to delete.
- **Requires Authentication:** Yes (User must be the author)
- **Returns:** The deleted `Post` object.

---

### `deleteComment(id: ID!): Comment!`

Deletes a comment.

- **Parameters:**
  - `id` (ID!): The ID of the comment to delete.
- **Requires Authentication:** Yes (User must be the author)
- **Returns:** The deleted `Comment` object.

---

### `likePost(postID: ID!): Post!`

Likes a post.

- **Parameters:**
  - `postID` (ID!): The ID of the post to like.
- **Requires Authentication:** Yes
- **Returns:** The updated `Post` object.

---

### `unlikePost(postID: ID!): Post!`

Unlikes a post.

- **Parameters:**
  - `postID` (ID!): The ID of the post to unlike.
- **Requires Authentication:** Yes
- **Returns:** The updated `Post` object.

---

### `register(username: String!, password: String!): String!`

Registers a new user.

- **Parameters:**
  - `username` (String!): The desired username.
  - `password` (String!): The desired password.
- **Returns:** A JWT token as a `String`.

---

### `login(username: String!, password: String!): String!`

Logs in an existing user.

- **Parameters:**
  - `username` (String!): The user's username.
  - `password` (String!): The user's password.
- **Returns:** A JWT token as a `String`.

---

## Resolvers

The resolvers handle the logic for each field in the GraphQL schema. Below is an overview of the main resolvers implemented:

### Query Resolvers

- **getPosts**: Fetches posts with pagination (10 posts per page) and sorts by creation date in descending order.
- **getPost**: Retrieves a single post by its ID.
- **getUser**: Finds a user by their username.
- **getComments**: Retrieves comments for a specific post, sorted by creation date.
- **searchAll**: Performs a search across both posts and users based on the query string.
- **searchUsers**: Searches for users matching the query string.
- **getPostsByIds**: Retrieves multiple posts based on an array of IDs.
- **getCommentsByIds**: Retrieves multiple comments based on an array of IDs.

### Mutation Resolvers

- **createPost**: Creates a new post authored by the authenticated user and updates the user's `postIds` array.
- **createComment**: Creates a new comment on a specified post, increments `amtComments` on the parent post, and updates the user's `commentIds` array.
- **deletePost**: Deletes a post (if the user is the author) and associated comments.
- **deleteComment**: Deletes a comment (if the user is the author) and decrements `amtComments` on the parent post.
- **likePost**: Likes a post if not already liked, increments `amtLikes` on the post, and updates the user's `likedPostIds` array.
- **unlikePost**: Unlikes a post if previously liked, decrements `amtLikes` on the post, and updates the user's `likedPostIds` array.
- **register**: Registers a new user with a unique username and hashed password, returns a JWT token.
- **login**: Authenticates a user and returns a JWT token.

### Union Type Resolver

- **SearchResult**: Determines the type (`User` or `Post`) for the `searchAll` query.

---

## Authentication

Authentication is handled using JSON Web Tokens (JWT). To perform mutations that require authentication (e.g., creating posts or comments), include the JWT token in the Authorization header:

```makefile
Authorization: Bearer YOUR_JWT_TOKEN

```

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository.**

2. **Create a new branch:**
   ```bash
   git checkout -b feature/YourFeature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m 'Add some feature'
   ```
4. **Push to the branch:**

   ```bash
   git push origin feature/YourFeature
   ```