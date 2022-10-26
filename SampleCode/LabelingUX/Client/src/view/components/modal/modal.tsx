import * as React from "react";
import { IModalProps, Modal as FluentModal, IDragOptions, ContextualMenu } from "@fluentui/react";
import { Spinner, SpinnerSize } from "@fluentui/react";
import { CloseButton } from "view/components/buttons/buttons";

import "./modal.scss";

interface IBaseModalProps extends IModalProps {
    header: React.ReactNode;
    body: React.ReactNode;
    footer: React.ReactNode;
    buttonGroup: React.ReactNode;
    width?: number | string;
    loadingText?: string;
    isLoading?: boolean;
    isDraggable?: boolean;
    onClose?: () => void;
}

export default class Modal extends React.PureComponent<IBaseModalProps> {
    private dragOptions: IDragOptions = {
        moveMenuItemText: "Move",
        closeMenuItemText: "Close",
        menu: ContextualMenu,
    };

    public render() {
        const { header, body, footer, buttonGroup, width, isLoading, isDraggable, loadingText, onClose, ...rest } =
            this.props;

        return (
            <FluentModal
                styles={{ main: { width: width || 560, minHeight: "auto" } }}
                dragOptions={isDraggable ? this.dragOptions : undefined}
                {...rest}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        {header}
                        {onClose && <CloseButton onClick={onClose} />}
                    </div>
                    <div className="modal-body">{body}</div>
                    <div className="modal-footer">
                        {footer}
                        <div className="modal-button-group">{buttonGroup}</div>
                    </div>
                    {isLoading && (
                        <div className="modal-loading">
                            <Spinner className="modal-spinner" size={SpinnerSize.medium} label={loadingText} />
                        </div>
                    )}
                </div>
            </FluentModal>
        );
    }
}
