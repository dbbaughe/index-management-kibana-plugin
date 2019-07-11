import React, { Component } from 'react';
import { EuiSuperDatePicker } from '@elastic/eui';
import AsyncInterval from "./AsyncInterval";

interface EuiRefreshPickerProps {
  isPaused: boolean;
  refreshInterval: number;
  onRefresh: Function;
  onRefreshChange: Function;
}

export default class EuiRefreshPicker extends Component<EuiRefreshPickerProps> {

  asyncInterval: AsyncInterval | undefined;

  componentDidMount = () => {
    if (!this.props.isPaused) {
      this.startInterval(this.props.refreshInterval);
    }
  };

  componentWillUnmount = () => {
    this.stopInterval();
  };

  onRefreshChange = ({ refreshInterval, isPaused }: { refreshInterval: number, isPaused: boolean }) => {
    this.stopInterval();
    if (!isPaused) {
      this.startInterval(refreshInterval);
    }
    if (this.props.onRefreshChange) {
      this.props.onRefreshChange({ refreshInterval, isPaused });
    }
  };

  stopInterval = () => {
    if (this.asyncInterval) {
      this.asyncInterval.stop();
    }
  };

  startInterval = (refreshInterval: number) => {
    const { onRefresh } = this.props;
    if (onRefresh) {
      const handler = () => { onRefresh({ refreshInterval }); };
      this.asyncInterval = new AsyncInterval(handler, refreshInterval);
    }
  };

  // Current version of EuiSuperDatePicker requires onTimeChange even if we don't use it
  onTimeChange = () => {};

  render() {
    return (
      <EuiSuperDatePicker
        isAutoRefreshOnly
        isPaused={this.props.isPaused}
        refreshInterval={this.props.refreshInterval}
        onRefreshChange={this.onRefreshChange}
        onTimeChange={this.onTimeChange}
      />
    );
  }
}
