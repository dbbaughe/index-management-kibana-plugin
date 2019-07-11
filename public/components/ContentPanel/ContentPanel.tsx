import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPanel, EuiTitle } from '@elastic/eui';

interface ContentPanelProps {
  title?: string;
  titleSize?: string;
  bodyStyles?: object;
  panelStyles?: object;
  horizontalRuleClassName?: string;
  actions?: React.ReactNode | React.ReactNode[];
  children: React.ReactNode | React.ReactNode[];
};

const ContentPanel = ({
  title = '',
  titleSize = 'l',
  bodyStyles = {},
  panelStyles = {},
  horizontalRuleClassName = '',
  actions,
  children,
}: ContentPanelProps) => (
  <EuiPanel style={{ paddingLeft: '0px', paddingRight: '0px', ...panelStyles }}>
    <EuiFlexGroup style={{ padding: '0px 10px' }} justifyContent="spaceBetween" alignItems="center">
      <EuiFlexItem>
        <EuiTitle size={titleSize}>
          <h3>{title}</h3>
        </EuiTitle>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          {Array.isArray(actions) ? (
            actions.map((action, idx) => <EuiFlexItem key={idx}>{action}</EuiFlexItem>)
          ) : (
            <EuiFlexItem>{actions}</EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>

    <EuiHorizontalRule margin="xs" className={horizontalRuleClassName} />

    <div style={{ padding: '0px 10px', ...bodyStyles }}>{children}</div>
  </EuiPanel>
);

export default ContentPanel;
