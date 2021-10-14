import jwt from 'jsonwebtoken';
import User from '../models/user';

const jwtMiddleware = async (ctx, next) => {
    const token = ctx.cookies.get('access_token');
    if (!token) return next(); //no_token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        ctx.state.user = {
            _id: decoded._id,
            username: decoded.username,
        };
        //토큰 유효기간 2시간 아래일 경우 재발급
        const now = Math.floor(Date.now() / 1000);
        if ( decoded.exp - now < 60 * 60 * 2) {
            const user = await User.findById(decoded._id);
            const token = user.generateToken();
            ctx.cookies.set('access_token', token, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
            });
        }
        return next();
    } catch (e) { // Token verification failed
        return next();
    }
}

export default jwtMiddleware;