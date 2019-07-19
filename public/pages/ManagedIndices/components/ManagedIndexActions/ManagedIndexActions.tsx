import React, { Component } from "react";
import { EuiButton, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { ModalConsumer } from "../../../../components/Modal";
import RetryModal from "../RetryModal";
import { IHttpService } from "angular";
import { ManagedIndexItem } from "../../../../../models/interfaces";

interface ManagedIndexActionsProps {
  isRemoveDisabled: boolean;
  isRetryDisabled: boolean;
  isChangeDisabled: boolean;
  onClickRemove: () => void;
  onClickChange: () => void;
  httpClient: IHttpService;
  selectedItems: ManagedIndexItem[];
}

export default class ManagedIndexActions extends Component<ManagedIndexActionsProps, object> {
  render() {
    const { isRemoveDisabled, isRetryDisabled, isChangeDisabled, onClickRemove, onClickChange, httpClient, selectedItems } = this.props;
    return (
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiButton disabled={isRemoveDisabled} onClick={onClickRemove} data-test-subj="removePolicyButton">
            Remove policy
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <ModalConsumer>
            {({ onShow }) => (
              <EuiButton
                disabled={isRetryDisabled}
                onClick={() => onShow(RetryModal, { httpClient, retryItems: selectedItems })}
                data-test-subj="retryPolicyButton"
              >
                Retry policy
              </EuiButton>
            )}
          </ModalConsumer>
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
