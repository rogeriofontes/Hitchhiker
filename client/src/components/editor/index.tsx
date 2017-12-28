import React from 'react';
import AceEditor from 'react-ace';

import 'brace/mode/javascript';
import 'brace/mode/json';
import 'brace/mode/xml';
import 'brace/theme/eclipse';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import 'brace/snippets/javascript';

import './style/index.less';

interface EditorProps {

    type?: 'javascript' | 'xml' | 'json' | 'text';

    value?: string;

    readOnly?: boolean;

    height?: number;

    width?: number;

    onChange?: (value: string) => void;

    fixHeight?: boolean;

    disableValidate?: boolean;
}

interface EditorState { }

class Editor extends React.Component<EditorProps, EditorState> {

    private offsetHeight = -1;

    private editorEle;

    public componentDidMount() {
        if (this.editorEle && this.props.disableValidate) {
            this.editorEle.editor.getSession().setUseWorker(false);
        }
    }

    private onAnnotatesChange = (annotates: Array<any>) => {
        if (!this.editorEle) {
            return;
        }
        const session = this.editorEle.editor.getSession();
        session.setAnnotations(annotates.filter(a => !this.needIgnoreErrorForVariable(session, a)));
    }

    private needIgnoreErrorForVariable = (session: any, annotate: any) => {
        const isBadStrError = annotate.type === 'error' && annotate.text === 'Bad string';
        if (!isBadStrError) {
            return false;
        }
        const lines = session.getDocument().$lines;
        const isLocateToVar = lines.length > annotate.row &&
            lines[annotate.row].length > annotate.column &&
            lines[annotate.row][Math.max(0, annotate.column - 1)] === '{' &&
            /\{\{.*\}\}/g.test(lines[annotate.row]);

        return isLocateToVar;
    }

    public render() {
        this.offsetHeight = this.offsetHeight === 1 ? -1 : this.offsetHeight + 1;
        const { type, value, height, width, readOnly, onChange } = this.props;
        const activeHeight = (height || 500) + this.offsetHeight;

        let props: any = {
            className: 'req-editor code-editor',
            mode: type,
            theme: 'eclipse',
            width: width ? width + 'px' : '100%',
            height: activeHeight + 'px',
            fontSize: 12,
            showGutter: true,
            showPrintMargin: false,
            wrapEnabled: true,
            value: value,
            focus: true,
            readOnly: readOnly,
            onChange: onChange,
            editorProps: { $blockScrolling: Infinity }
        };
        if (!this.props.fixHeight) {
            const maxLines = activeHeight / 15 | 0;
            props = {
                ...props,
                maxLines: maxLines,
                minLines: maxLines,
            };
        }
        if (type === 'javascript') {
            props = {
                ...props,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                setOptions: { enableSnippets: true }
            };
        }

        return (
            <AceEditor ref={ele => this.editorEle = ele} {...props} onValidate={this.onAnnotatesChange} />
        );
    }
}

export default Editor;