import React from "react";
import {
  EuiSpacer,
  EuiButton,
  // @ts-ignore
  EuiCodeEditor,
  EuiText,
  // @ts-ignore
  EuiCopy,
} from "@elastic/eui";
import "brace/theme/github";
import "brace/mode/json";
import ContentPanel from "../../../../../components/ContentPanel/ContentPanel";

interface DefinePolicyProps {
  jsonString: string;
  hasJSONError: boolean;
  onChange: (value: string) => void;
  onAutoIndent: () => void;
}

const DefinePolicy = ({ jsonString, onChange, onAutoIndent, hasJSONError }: DefinePolicyProps) => (
  <ContentPanel
    bodyStyles={{ padding: "initial" }}
    title="Define policy"
    titleSize="s"
    actions={[
      <EuiCopy textToCopy={jsonString}>
        {(copy: () => void) => (
          <EuiButton iconType="copyClipboard" onClick={copy}>
            Copy
          </EuiButton>
        )}
      </EuiCopy>,
      <EuiButton iconType="editorAlignLeft" onClick={onAutoIndent} disabled={hasJSONError}>
        Auto Indent
      </EuiButton>,
    ]}
  >
    <div style={{ paddingLeft: "10px" }}>
      <EuiText size="xs">
        <p>Create a policy with a JSON configuration file. This can be added directly in the code editor below.</p>
      </EuiText>
    </div>
    <EuiSpacer size="s" />
    <EuiCodeEditor
      mode="json"
      theme="github"
      width="100%"
      value={jsonString}
      onChange={onChange}
      setOptions={{
        fontSize: "14px",
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
      }}
      aria-label="Code Editor"
    />
  </ContentPanel>
);

export default DefinePolicy;
