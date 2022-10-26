import * as React from "react";
import { Text, PrimaryButton, DefaultButton } from "@fluentui/react";

import Modal from "view/components/modal/modal";

interface IMessageModalProps {
    isOpen: boolean;
    title: string;
    body: React.ReactNode;
    actionButtonDisabled?: boolean;
    actionButtonText?: string;
    rejectButtonText?: string;
    isLoading?: boolean;
    loadingText?: string;
    width?: number;
    onActionButtonClick?: () => void;
    onClose?: () => void;
    onDismiss?: () => void;
}

export class MessageModal extends React.PureComponent<IMessageModalProps> {
    public render() {
        const {
            isOpen,
            title,
            body,
            width,
            isLoading,
            actionButtonDisabled,
            actionButtonText,
            rejectButtonText,
            loadingText,
            onActionButtonClick,
            onClose,
            onDismiss,
        } = this.props;
        return (
            <Modal
                isOpen={isOpen}
                isLoading={isLoading}
                header={<Text variant="xLarge">{title}</Text>}
                body={body}
                footer={<div></div>}
                buttonGroup={
                    <>
                        {onActionButtonClick && (
                            <PrimaryButton
                                text={actionButtonText}
                                disabled={actionButtonDisabled}
                                onClick={onActionButtonClick}
                            />
                        )}
                        <DefaultButton text={rejectButtonText ? rejectButtonText : "Cancel"} onClick={onClose} />
                    </>
                }
                loadingText={loadingText}
                width={width}
                onClose={onClose}
                onDismiss={onDismiss}
            />
        );
    }
}

export default MessageModal;
