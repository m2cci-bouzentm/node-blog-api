# Node Blog API

This is a Node.js-based blog API that uses Express, Prisma, and JWT for authentication. The API allows users to sign up, sign in, create posts, and comment on posts.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [License](#license)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/node-blog-api.git
   cd node-blog-api
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Set up the database:

   ```sh
   npx prisma migrate dev
   ```

4. Create a `.env` file in the root directory and add your environment variables (see [Environment Variables](#environment-variables)).

## Usage

To start the server in development mode:
`sh
    npm run dev
    `

To start the server in production mode:
`sh
    npm start
    `

## API Endpoints

### Authentication

- **POST /signin**: Sign in a user.
- **POST /signup**: Sign up a new user.

### Posts

- **GET /posts**: Get all posts.
- **POST /posts**: Create a new post.
- **GET /posts/:postId**: Get a specific post.
- **PUT /posts/:postId**: Update a specific post.
- **DELETE /posts/:postId**: Delete a specific post.

### Comments

- **GET /posts/:postId/comments**: Get all comments for a specific post.
- **POST /posts/:postId/comments**: Create a new comment for a specific post.
- **GET /posts/:postId/comments/:commentId**: Get a specific comment.
- **PUT /posts/:postId/comments/:commentId**: Update a specific comment.
- **DELETE /posts/:postId/comments/:commentId**: Delete a specific comment.

## Environment Variables

Create a `.env` file in the root directory and add the following environment variables:
`env
    DATABASE_URL=your_database_url
    SECRET_KEY=your_secret_key
    AUTHOR_KEY=a_secret_key_to_become_an_author
    PORT=3000
    `

## Project Structure

- `.env`
- `.gitignore`
- `.vscode/`
  - `settings.json`
- `app.js`
- `bin/`
  - `www`
- `controllers/`
  - `commentsController.js`
  - `indexController.js`
  - `postsController.js`
- `package.json`
- `prisma/`
  - `migrations/`
    - `20240930105247_init/`
      - `migration.sql`
    - `20241005082510_updated_some_fields_in_post_model/`
      - `migration.sql`
  - `migration_lock.toml`
  - `schema.prisma`
- `public/`
  - `images/`
  - `javascripts/`
  - `stylesheets/`
    - `style.css`
- `README.md`
- `routes/`
  - `comments.js`
  - `index.js`
  - `posts.js`

## License

This project is licensed under the MIT License.
