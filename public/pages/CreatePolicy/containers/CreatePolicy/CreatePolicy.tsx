import React, { Component } from 'react';
import {
  EuiSpacer,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiCodeEditor,
  EuiFormRow,
  EuiText,
} from '@elastic/eui';
import chrome from 'ui/chrome';
import 'brace/theme/github';
import 'brace/mode/json';
import ContentPanel from "../../../../components/ContentPanel/ContentPanel";
import queryString from 'query-string';
import {RouteComponentProps} from "react-router";
import {IHttpService} from "angular";
import {DEFAULT_POLICY} from "../../utils/constants";

interface CreatePolicyProps extends RouteComponentProps {
  edit?: boolean;
  httpClient: IHttpService;
}

interface CreatePolicyState {
  value: string;
  json: string;
  policyToEdit: object | null;
}

class CreatePolicy extends Component<CreatePolicyProps, CreatePolicyState> {

  constructor(props: CreatePolicyProps) {
    super(props);

    this.state = { value: '', json: DEFAULT_POLICY, policyToEdit: null };

    this.onCancel = this.onCancel.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeJSON = this.onChangeJSON.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  async componentDidMount(): Promise<void> {
    chrome.breadcrumbs.set([{ text: 'Index Management', href: '#/' }, {
      text: 'Policies',
      href: '#/policies',
    }]);
    if (this.props.edit) {
      const { id } = queryString.parse(this.props.location.search);
      chrome.breadcrumbs.push({ text: 'Edit policy' });
      chrome.breadcrumbs.push({ text: id });
      await this.getPolicyToEdit(id);
    } else {
      chrome.breadcrumbs.push({ text: 'Create policy' });
    }
  }

  onCancel() {
    if (this.props.edit) this.props.history.goBack();
    else this.props.history.push('/policies');
  }

  async getPolicyToEdit(policyId: string) {
    const { httpClient } = this.props;
    try {
      const resp = await httpClient.get(`../api/ism/policies/${policyId}`);
      if (resp.data.ok) {
        this.setState({
          policyToEdit: resp.data.resp,
          value: resp.data.resp.id,
          json: JSON.stringify({ policy: resp.data.resp.policy }, null, 4),
        });
      }
      console.log('resp:', resp);
    } catch (err) {

    }
  }

  async onCreate(policyId, policy) {
    const { httpClient } = this.props;
    try {
      const resp = await httpClient.put(`../api/ism/policies/${policyId}`, policy);
      const { data: { ok } } = resp;
      if (ok) {
        this.props.history.push(`/policies`);
      } else {
        console.log('Failed to create:', resp);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async onUpdate(policyId, policy) {
    const { httpClient } = this.props;
    const { policyToEdit } = this.state;
    try {
      const resp = await httpClient.put(`../api/ism/policies/${policyId}?ifSeqNo=${policyToEdit.seqNo}&ifPrimaryTerm=${policyToEdit.primaryTerm}`, policy);
      const { data: { ok } } = resp;
      if (ok) {
        this.props.history.push(`/policies`);
      } else {
        console.log('Failed to update:', resp);
      }
    } catch (err) {
      console.error(err);
    }
  }

  onChange(e) {
    this.setState({ value: e.target.value });
  }

  onChangeJSON(value) {
    this.setState({ json: value });
  }

  onSubmit() {
    const { edit } = this.props;
    console.log('onSubmit edit:', edit);
    try {
      const { value, json } = this.state;
      const policy = JSON.parse(json);
      if (edit) this.onUpdate(value, policy);
      else this.onCreate(value, policy);
    } catch (err) {
      console.log("Bad JSON for policy");
      console.error(err);
    }

  }

  render() {
    const { edit } = this.props;
    const { value, json } = this.state;

    let hasJSONError = false;
    try {
      JSON.parse(json);
    } catch (err) {
      hasJSONError = true;
    }

    return (
      <div style={{ padding: '25px 50px' }}>
        <EuiTitle size="l">
          <h1>{edit ? 'Edit' : 'Create'} policy</h1>
        </EuiTitle>
        <EuiSpacer />
        <ContentPanel
          bodyStyles={{ padding: 'initial' }}
          title="Policy"
          titleSize="s"
        >
          <div style={{ paddingLeft: '10px' }}>
            <EuiText size="xs">
              <p>Specify a unique ID that helps you identify this policy</p>
            </EuiText>
            <EuiSpacer size="s" />
            <EuiFormRow label="Policy ID" helpText="Use something easy to remember">
              <EuiFieldText
                placeholder="Policy ID"
                readOnly={edit}
                value={value}
                onChange={this.onChange}
                aria-label="Use aria labels when no actual label is in use"
              />
            </EuiFormRow>
          </div>
        </ContentPanel>
        <EuiSpacer />
        <ContentPanel
          bodyStyles={{ padding: 'initial' }}
          title="Define policy"
          titleSize="s"
        >
          <div style={{ paddingLeft: '10px' }}>
            <EuiText size="xs">
              <p>Create a policy with a JSON configuration file. This can be added directly in the code editor below.</p>
            </EuiText>
          </div>
          <EuiSpacer size="s" />
          <EuiCodeEditor
            mode="json"
            theme="github"
            width="100%"
            value={json}
            onChange={this.onChangeJSON}
            setOptions={{
              fontSize: '14px',
              enableBasicAutocompletion: true,
              enableSnippets: true,
              enableLiveAutocompletion: true,
            }}
            aria-label="Code Editor"
          />
        </ContentPanel>
        <EuiSpacer />
        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel}>Cancel</EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onSubmit} isLoading={false} disabled={hasJSONError}>
              {edit ? 'Update' : 'Create'}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}

export default CreatePolicy;
