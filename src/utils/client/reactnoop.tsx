import * as React from 'react';
import { CodeSnippetGenerator } from 'utils/constants/lesson';

const UPGRADE_TEXT = '// Upgrade for full course access';

export const emptyComponent: React.FC = () => null;

export const upgradeCodeFunction: CodeSnippetGenerator = _codingLanguage => <>{UPGRADE_TEXT}</>;
