import React, { Component } from 'react';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';

interface IndexActionsProps {
  isAddDisabled: boolean;
  onClickAdd: Function;
}

export default class IndexActions extends Component<IndexActionsProps, object> {

  render() {
    const { isAddDisabled, onClickAdd } = this.props;
    return (
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiButton disabled={isAddDisabled} onClick={onClickAdd} data-test-subj="addPolicyButton">
            Add policy
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
