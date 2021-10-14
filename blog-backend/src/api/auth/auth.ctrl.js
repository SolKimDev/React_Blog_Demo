import Joi from 'joi';
import User from '../../models/user';

/* 근데 이렇게하면 패킷단에서 암호화가 안되지 않나..??
로아꼴나는거아냐..??
POST /api/auth/register
    {
        username: 'username',
        password: 'password'
    }
*/
export const register = async (ctx) => {
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  //ID 중복검사
  const { username, password } = ctx.request.body;
  try {
    const exists = await User.findByUsername(username);
    if (exists) {
      ctx.status = 409;
      return;
    }

    const user = new User({
      username,
    });
    await user.setPassword(password);
    await user.save();

    //응답할 데이터에서 hashedPassword 필드 제거한 뒤 응답
    ctx.body = user.serialize();

    const token = user.generateToken();
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24, //24시간
      httpOnly: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
POST /api/auth/login
{
    username: 'username'
    password: 'password'
}
*/
export const login = async (ctx) => {
    const { username, password } = ctx.request.body;
  
    // username, password 가 없으면 에러 처리
    if (!username || !password) {
      ctx.status = 401; // Unauthorized
      return;
    }
  
    try {
      const user = await User.findByUsername(username);
      // 계정이 존재하지 않으면 에러 처리
      if (!user) {
        ctx.status = 401;
        return;
      }
      const valid = await user.checkPassword(password);
      // 잘못된 비밀번호
      if (!valid) {
        ctx.status = 401;
        return;
      }
      ctx.body = user.serialize();
  
      const token = user.generateToken();
      ctx.cookies.set('access_token', token, {
        maxAge: 1000 * 60 * 60 * 24, //24hrs
        httpOnly: true,
      });
    } catch (e) {
      ctx.throw(500, e);
    }
  };

export const check = async (ctx) => {
    const { user } = ctx.state;
    if (!user) {
        //Login state false
        ctx.status = 401;
        return;
    }
    ctx.body = user;
};

/*
POST /api/auth/logout
*/
export const logout = async (ctx) => {
    ctx.cookies.set('access_token');
    ctx.status = 204;
};
