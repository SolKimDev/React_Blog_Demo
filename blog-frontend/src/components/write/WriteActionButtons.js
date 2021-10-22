import React from 'react';
import styled from 'styled-components';
import Button from '../common/Button';

const WriteActionButtonsBlock = styled.div`
    margin-top: 1rem;
    margin-bottom: 3rem;
    button + button {
        margin-left: 0.5rem;
    }
`;

//TagBox 버튼과 같은 높이로 지정한 후 여백 지정
const StyledButton = styled(Button)`
    height: 2.215rem
    & + & {
        margin-left: 0.5rem;
    }
`;

const WriteActionButtons = ({ onCancel, onPublish, isEdit }) => {
    return (
        <WriteActionButtonsBlock>
            <StyledButton cyan onClick={onPublish}>포스트 {isEdit ? '수정' : '등록'}</StyledButton>
            <StyledButton onClick={onCancel}>취소</StyledButton>
        </WriteActionButtonsBlock>
    );
};

export default WriteActionButtons;