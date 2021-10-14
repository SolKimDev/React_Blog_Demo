require('dotenv').config();
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';

import api from './api';
import jwtMiddleware from './lib/jwtMiddleware';

const { PORT, MONGO_URI } = process.env; //환경변수 접근

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    //useFindAndModify: false  : Mongoose 6.0 이상이므로 에러 발생
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((e) => {
    console.error(e);
  });

const app = new Koa();
const router = new Router();

router.use('/api', api.routes());

app.use(bodyParser());
app.use(jwtMiddleware);

app.use(router.routes()).use(router.allowedMethods());

//if port not assigned, use 4000
const port = PORT || 4000;
app.listen(port, () => {
  console.log('Listening to port %d', port);
});
