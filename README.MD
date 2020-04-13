# A blog system made in ExpressJS
[![Build Status](https://travis-ci.com/HDK101/express-blog.svg?branch=master)](https://travis-ci.com/HDK101/express-blog)

## About
A simple blog system that i made to test my skills.

## Pre-requisites
- MongoDB(4.2.5)
https://www.mongodb.com/download-center/community

## Technologies
- EJS(3.0.1)
- Express(4.17.1)
- Mongoose(5.8.9)
- Pm2(4.2.3)(Production)
- Nodemon(2.0.2)(Dev)
- Mocha(7.0.1)(Test)

## Installation
1. Clone repository
2. Run **npm install**
3. Run **npm run createBlog** and configure your blog
4. Install Pm2 globally, **npm install -g pm2**

## Running
- **npm run dev** starts development build(nodemon)
- **npm run production** starts production build(pm2)

## Misc
### Scripts
- **npm run resetBlog** clears DBs and configuration file
- **npm run restart** restarts the process in pm2.
- **npm run stop** stop blog process in pm2.
- **npm run logs** show logs on all process in pm2
- **npm run test** executes Mocha to test.
