import React from 'react';
import Responsive from '../components/common/Responsive';
import EditorContainer from '../containers/writer/EditorContainer';
import TagBoxContainer from '../containers/writer/TagBoxContainer';
import WriteActionButtonsContainer from '../containers/writer/WriteActionButtonsContainer';

const WritePage = () => {
    return (
        <Responsive>
            <EditorContainer />
            <TagBoxContainer />
            <WriteActionButtonsContainer />
        </Responsive>
    );
};

export default WritePage;