import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeField, initializeForm, register} from '../../modules/auth';
import AuthForm from '../../components/auth/AuthForm';
import { check } from '../../modules/user';
import { withRouter } from 'react-router-dom';

const RegisterForm = ({ history }) => {
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const { form, auth, authError, user } = useSelector(({ auth, user }) => ({
        form: auth.register,
        auth: auth.auth,
        authError: auth.authError,
        user: user.user,
    }));
    
    const onChange = e => {
        const { value, name } = e.target;
        dispatch(
            changeField({
                form: 'register',
                key: name,
                value
            })
        );
    };

    const onSubmit = e => {
        e.preventDefault();
        const { username, password, passwordConfirm } = form;

        //빈 칸 있는 경우
        if([username, password, passwordConfirm].includes('')){
            setError('입력하지 않은 항목이 존재합니다');
            return;
        }

        //패스워드 & 패스워드 확인 불일치하는 경우
        if (password !== passwordConfirm) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        dispatch(register({ username, password }));
    };

    //Init form when 1st render of the component
    useEffect(() => {
        dispatch(initializeForm('register'));
    }, [dispatch]);
    
    useEffect(() => {
        //SUCCESS
        if(auth){
            console.log('Register Done!');
            console.log(auth);
            dispatch(check());
        }
        
        //FAILURE
        if(authError) {
            //아이디 중복
            if (authError.response.status === 409) {
                setError('아이디가 이미 존재합니다');
                return;
            }

            //기타 이유로 실패
            setError('알 수 없는 오류');
            return;
        }
    }, [auth, authError, dispatch]);

    //user 값 확인 후 홈으로 이동
    useEffect(() => {
        if(user) {
            console.log('check API 성공');
            console.log(user);
            history.push('/');
        }
    }, [history, user]);

    return (
        <AuthForm
            type="register"
            form={form}
            onChange={onChange}
            onSubmit={onSubmit}
            error={error}
        />
    );
};

export default withRouter(RegisterForm);