# sample-nestjs-with-docker

Inherit from this [repo](https://github.com/gothinkster/realworld-example-apps)

# Getting started

## Installation
    
Install dependencies
    
    yarn install

Copy .env file

    cp .env.example .env

##### Prisma

----------

Set mysql database settings in .env

    DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

To create all tables in the new database make the database migration from the prisma schema defined in prisma/schema.prisma

    npx prisma migrate dev

Now generate the prisma client from the migrated database with the following command

    npx prisma generate

The database tables are now set up and the prisma client is generated. For more information see the docs:

- https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project-typescript-mysql


----------

## NPM scripts

- `yarn start` - Start application
- `yarn start:watch` - Start application in watch mode
- `yarn test` - run Jest test runner 
- `yarn start:prod` - Build application

----------

## Start application

- `yarn start`
- Test api with `http://localhost:3000/api/articles` in your favourite browser

----------

# Authentication
 
This applications uses JSON Web Token (JWT) to handle authentication. The token is passed with each request using the `Authorization` header with `Token` scheme. The JWT authentication middleware handles the validation and authentication of the token. Please check the following sources to learn more about JWT.

----------

# Docker

To set up a database with docker

docker run --name backend-nestjs -d \
    -p 3306:3306 \
    -e MYSQL_ROOT_PASSWORD=root \
    --restart unless-stopped \
    --volume=./mysql/conf.d:/etc/mysql/conf.d \
    --volume=./mysql/data:/var/lib/mysql \
    mysql:8