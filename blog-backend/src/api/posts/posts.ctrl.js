const { post } = require(".");

let postId = 1;
const posts = [
    {
        id: 1,
        title: 'title',
        body: 'body',
    },
];

//Write a post
//POST /api/posts
//{title, body}
export const write = ctx => {
    const { title, body } = ctx.request.body;
    postId += 1;
    const post = { id: postId, title, body };
    posts.push(post);
    ctx.body = post;
};

//Inquire post list
//GET /api/posts
export const list = ctx => {
    ctx.body = posts;
};

//Inquire a post
//GET /api/posts/:id
export const read = ctx => {
    const { id } = ctx.params;
    const post = posts.find(p => p.id.toString() === id);
    if (!post) {
        ctx.status = 404;
        ctx.body = {
            message: '404\npost not found'
        };
        return;
    }
    ctx.body = post;
};

//Delete a post
//DELETE /api/posts:id
export const remove = ctx => {
    const { id } = ctx.params;
    const index = posts.findIndex(p => p.id.toString() === id);
    if (index === -1) {
        ctx.status = 404;
        ctx.body = {
            message: '404\npost not found'
        };
        return;
    }
    posts.splice(index, 1);
    ctx.status = 204; // No Content
};

//Replace a post
//PUT /api/posts/:id
//{title, body}
export const replace = ctx => {
    const { id } = ctx.params;
    const index = posts.findIndex(p => p.id.toString() === id );
    if(index === -1) {
        ctx.status = 404;
        ctx.body = {
            message: '404\npost not found'
        };
        return;
    }
    posts[index] = {
        id,
        ...ctx.request.body,
    };
    ctx.body = posts[index];
};

//Update a post
//PATCH /api/posts/:id
//{title, body}
export const update = ctx => {
    const { id } = ctx.params;
    const index = posts.findIndex(p => p.id.toString() === id );
    if(index === -1) {
        ctx.status = 404;
        ctx.body = {
            message: '404\npost not found'
        }
        return;
    }
    posts[index] = {
        ...posts[index],
        ...ctx.request.body,
    };
    ctx.body = posts[index];
};