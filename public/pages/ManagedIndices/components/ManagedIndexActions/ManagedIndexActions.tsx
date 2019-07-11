import React, { Component } from 'react';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';

const PLUGIN_NAME = "index_management_kibana";

interface ManagedIndexActionsProps {
  isRemoveDisabled: boolean;
  isRetryDisabled: boolean;
  isChangeDisabled: boolean;
  onClickRemove: Function;
  onClickRetry: Function;
  onClickChange: Function;
}

export default class ManagedIndexActions extends Component<ManagedIndexActionsProps, object> {

  render() {
    const { isRemoveDisabled, isRetryDisabled, isChangeDisabled, onClickRemove, onClickRetry, onClickChange } = this.props;
    return (
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiButton disabled={isRemoveDisabled} onClick={onClickRemove} data-test-subj="removePolicyButton">
            Remove policy
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton disabled={isRetryDisabled} onClick={onClickRetry} data-test-subj="retryPolicyButton">
            Retry policy
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            disabled={isChangeDisabled}
            onClick={onClickChange}
            // href={`${PLUGIN_NAME}#/change-policy`}
            data-test-subj="changePolicyButton"
          >
            Change policy
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
