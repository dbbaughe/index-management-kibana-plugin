import React, { Component } from "react";
import { EuiButton, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { PLUGIN_NAME } from "../../../../utils/constants";

interface PolicyActionsProps {
  isEditDisabled: boolean;
  onClickEdit: Function;
  isDeleteDisabled: boolean;
  onClickDelete: Function;
}

class PolicyActions extends Component<PolicyActionsProps, object> {
  render() {
    const { isEditDisabled, onClickEdit, isDeleteDisabled, onClickDelete } = this.props;
    return (
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiButton disabled={isDeleteDisabled} onClick={onClickDelete} data-test-subj="deleteButton">
            Delete
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton disabled={isEditDisabled} onClick={onClickEdit} data-test-subj="editButton">
            Edit
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton fill href={`${PLUGIN_NAME}#/create-policy`} data-test-subj="createButton">
            Create policy
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

export default PolicyActions;
