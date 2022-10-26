import * as React from "react";
import { ProgressIndicator } from "@fluentui/react";

import "./analyzeProgressBar.scss";

interface IAnalyzeProgressBarProps {
    title: string;
    subtitle: string;
    percentComplete: number | undefined;
}

export class AnalyzeProgressBar extends React.PureComponent<IAnalyzeProgressBarProps> {
    public render() {
        const { title, subtitle, percentComplete } = this.props;
        return (
            <div className="analyze-progress-bar">
                <section className="progress-details">
                    <article className="progress-title">{title}</article>
                    <article className="progress-subtitle">{subtitle}</article>
                </section>
                <ProgressIndicator percentComplete={percentComplete} />
            </div>
        );
    }
}
