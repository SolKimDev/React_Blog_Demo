const Router = require('koa-router');
import * as postsCtrl from './posts.ctrl';

// /api/posts/
const posts = new Router();
posts.get('/', postsCtrl.list);
posts.post('/', postsCtrl.write);

// /api/posts/:id
const post = new Router();
post.get('/', postsCtrl.checkObjectId, postsCtrl.read);
post.delete('/', postsCtrl.checkObjectId, postsCtrl.remove);
post.patch('/', postsCtrl.checkObjectId, postsCtrl.update);

posts.use('/:id', postsCtrl.checkObjectId, post.routes());

export default posts;