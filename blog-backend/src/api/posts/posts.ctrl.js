import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from 'joi';
import sanitizeHtml from 'sanitize-html';

const { ObjectId } = mongoose.Types;

//quill에 적용한 옵션과 동일하게 적용
//You can find more options in https://www.npmjs.com/package/sanitize-html
const sanitizeOption = {
  allowedTags: [
    'h1',
    'h2',
    'b',
    'i',
    'u',
    's',
    'p',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src'],
    li: ['class'],
  },
  allowedSchemes: ['data', 'http'],
};

//MiddleWares
export const getPostById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }
  try {
      const post = await Post.findById(id);
      //if post doesn't exists
      if (!post) {
          ctx.status = 404;
          return;
      }
      ctx.state.post = post;
      return next();
  } catch (e) {
      ctx.throw(500,e);
  }
};

export const checkOwnPost = (ctx, next) => {
    const { user, post } = ctx.state;
    if (post.user._id.toString() !== user._id) {
        ctx.status = 403;
        return;
    }
    return next();
}

//CRUD Functions
/*
POST /api/posts
{
    title: '제목'
    body: '내용'
    tags: ['태그1', '태그2']
}
*/
export const write = async (ctx) => {
  //Field validation using Joi (Set Validation Schema)
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
  });

  //set Err if it is not validate
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  //Write data
  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body: sanitizeHtml(body, sanitizeOption),
    tags,
    user: ctx.state.user,
  });
  try {
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 클라이언트단에서 파싱하면 200자 제한이 이상하게 적용될 수 있기 때문에, 서버단에서 태그 제거 작업을 진행한다.
const removeHtmlAndShorten = body => {
  const filtered = sanitizeHtml(body, {
    allowedTags: [],
  });
  return filtered.length < 200 ? filtered: `${filtered.slice(0, 200)}...`;
}

/*
 GET /api/posts?username=&tag=&page=
*/
export const list = async (ctx) => {
  const page = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  const { tag, username } = ctx.query;
  const query = {
      ...(username ? { 'user.username' : username } : {}),
      ...(tag ? { tags: tag } : {}),
  };

  try {
    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const postCount = await Post.countDocuments(query).exec();
    ctx.set('Last-Page', Math.ceil(postCount / 10));
    ctx.body = posts
      .map(post => post.toJSON())
      .map(post => ({
        ...post,
        body: removeHtmlAndShorten(post.body),
      }));
      // .map(post => ({
      //   ...post,
      //   body: post.body.length < 200 ? post.body : `${post.body.slice(0,200)}...`,
      // }));    
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
 GET /api/posts:id
*/
export const read = async (ctx) => {
  ctx.body = ctx.state.post;
};

/*
DELETE /api/posts:id
*/
export const remove = async (ctx) => {
  const { id } = ctx.params;
  try {
    const post = await Post.findByIdAndRemove(id).exec();
    ctx.status = 204;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
PATCH /api/posts:id
{
    title: '수정',
    body: '수정 내용'
    tags: ['수정', '태그']
}
*/
export const update = async (ctx) => {
  const { id } = ctx.params;

  //Field validation using Joi (Set Validation Schema)
  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  //set Err if it is not validate
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  //HTML Filtering
  const nextData = { ...ctx.request.body }; //copy object and ..
  if ( nextData.body ) { // if body is true, filter the body
    nextData.body = sanitizeHtml(nextData.body, sanitizeOption);
  }

  //Write Data
  try {
    const post = await Post.findByIdAndUpdate(id, nextData, {
      new: true,
    }).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};
