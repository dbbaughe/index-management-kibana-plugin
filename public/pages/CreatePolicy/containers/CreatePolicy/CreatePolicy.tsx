import React, { ChangeEvent, Component } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiButton, EuiButtonEmpty } from "@elastic/eui";
import chrome from "ui/chrome";
import { toastNotifications } from "ui/notify";
import "brace/theme/github";
import "brace/mode/json";
import queryString from "query-string";
import { RouteComponentProps } from "react-router";
import { IHttpService } from "angular";
import { DEFAULT_POLICY } from "../../utils/constants";
import DefinePolicy from "../components/DefinePolicy";
import ConfigurePolicy from "../components/ConfigurePolicy";
import { DocumentPolicy, Policy } from "../../../../../models/interfaces";

interface CreatePolicyProps extends RouteComponentProps {
  isEdit: boolean;
  httpClient: IHttpService;
}

interface CreatePolicyState {
  value: string;
  json: string;
  policySeqNo: number | null;
  policyPrimaryTerm: number | null;
}

interface GetPolicyResponse {
  data: {
    ok: boolean;
    resp?: DocumentPolicy;
    error?: string;
  };
}

class CreatePolicy extends Component<CreatePolicyProps, CreatePolicyState> {
  constructor(props: CreatePolicyProps) {
    super(props);

    this.state = { policySeqNo: null, policyPrimaryTerm: null, value: "", json: "" };
  }

  componentDidMount = async (): Promise<void> => {
    chrome.breadcrumbs.set([
      { text: "Index Management", href: "#/" },
      {
        text: "Policies",
        href: "#/policies",
      },
    ]);
    if (this.props.isEdit) {
      const { id } = queryString.parse(this.props.location.search);
      chrome.breadcrumbs.push({ text: "Edit policy" });
      chrome.breadcrumbs.push({ text: id });
      await this.getPolicyToEdit(id);
    } else {
      chrome.breadcrumbs.push({ text: "Create policy" });
      this.setState({ json: DEFAULT_POLICY });
    }
  };

  onCancel = (): void => {
    if (this.props.isEdit) this.props.history.goBack();
    else this.props.history.push("/policies");
  };

  getPolicyToEdit = async (policyId: string): Promise<void> => {
    try {
      const { httpClient } = this.props;
      const resp: GetPolicyResponse = await httpClient.get(`../api/ism/policies/${policyId}`);
      if (resp.data.ok && resp.data.resp != null) {
        this.setState({
          policySeqNo: resp.data.resp.seqNo,
          policyPrimaryTerm: resp.data.resp.primaryTerm,
          value: resp.data.resp.id,
          json: JSON.stringify({ policy: resp.data.resp.policy }, null, 4),
        });
      } else {
        toastNotifications.addDanger("Could not load the policy, please try again.");
      }
    } catch (err) {
      toastNotifications.addDanger("Could not load the policy, please try again.");
      console.error(err);
    }
  };

  onCreate = async (policyId: string, policy: Policy): Promise<void> => {
    const { httpClient } = this.props;
    try {
      const resp = await httpClient.put(`../api/ism/policies/${policyId}`, policy);
      const {
        data: { ok },
      } = resp;
      if (ok) {
        this.props.history.push(`/policies`);
      } else {
        console.log("Failed to create:", resp);
      }
    } catch (err) {
      console.error(err);
    }
  };

  onUpdate = async (policyId: string, policy: Policy): Promise<void> => {
    try {
      const { httpClient } = this.props;
      const { policyPrimaryTerm, policySeqNo } = this.state;
      if (policySeqNo == null || policyPrimaryTerm == null) {
        toastNotifications.addDanger("Could not update policy without seqNo and primaryTerm");
        return;
      }
      const resp = await httpClient.put(
        `../api/ism/policies/${policyId}?ifSeqNo=${policySeqNo}&ifPrimaryTerm=${policyPrimaryTerm}`,
        policy
      );
      const {
        data: { ok },
      } = resp;
      if (ok) {
        this.props.history.push(`/policies`);
      } else {
        console.log("Failed to update:", resp);
      }
    } catch (err) {
      console.error(err);
    }
  };

  onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ value: e.target.value });
  };

  onChangeJSON = (value: string): void => {
    this.setState({ json: value });
  };

  onAutoIndent = (): void => {
    try {
      const parsedJSON = JSON.parse(this.state.json);
      this.setState({ json: JSON.stringify(parsedJSON, null, 4) });
    } catch (err) {
      // do nothing
    }
  };

  onSubmit = async (): Promise<void> => {
    const { isEdit } = this.props;
    console.log("onSubmit isEdit:", isEdit);
    try {
      const { value, json } = this.state;
      const policy = JSON.parse(json);
      if (isEdit) await this.onUpdate(value, policy);
      else await this.onCreate(value, policy);
    } catch (err) {
      console.log("Bad JSON for policy");
      console.error(err);
    }
  };

  render() {
    const { isEdit } = this.props;
    const { value, json } = this.state;

    let hasJSONError = false;
    try {
      JSON.parse(json);
    } catch (err) {
      hasJSONError = true;
    }

    return (
      <div style={{ padding: "25px 50px" }}>
        <EuiTitle size="l">
          <h1>{isEdit ? "Edit" : "Create"} policy</h1>
        </EuiTitle>
        <EuiSpacer />
        <ConfigurePolicy policyId={value} isEdit={isEdit} onChange={this.onChange} />
        <EuiSpacer />
        <DefinePolicy jsonString={json} onChange={this.onChangeJSON} onAutoIndent={this.onAutoIndent} hasJSONError={hasJSONError} />
        <EuiSpacer />
        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel}>Cancel</EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onSubmit} isLoading={false} disabled={hasJSONError}>
              {isEdit ? "Update" : "Create"}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}

export default CreatePolicy;
