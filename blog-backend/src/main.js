require('dotenv').config();
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';
import serve from 'koa-static';
import path from 'path';
import send from 'koa-send';

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

const buildDirectory = path.resolve(__dirname, '../../blog-frontend/build');
app.use(serve(buildDirectory));
app.use(async ctx => {
  //404 + Address starts with not /api
  if (ctx.status === 404 && ctx.path.indexOf('/api') !== 0 ) {
    //return index.html
    await send(ctx, 'index.html', { root: buildDirectory });
  }
});

//if port not assigned, use 4000
const port = PORT || 4000;
app.listen(port, () => {
  console.log('Listening to port %d', port);
});
