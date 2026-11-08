import * as React from 'react';
import { TreeNode, TreeOrder, parseTree, traverseTree } from 'utils/shared/learningTools';
import { Diagram, ToolPanel, Controls, Buttons, ErrorText } from '../styles';

const examples: Record<string, string> = {
  'Balanced tree': '[4,2,6,1,3,5,7]',
  'Missing children': '[1,2,3,null,4,5,null]',
  'Repeated values': '["a","b","a",null,"c"]',
  'Empty tree': '[]',
};
const names: Record<TreeOrder, string> = {
  preorder: 'Preorder',
  inorder: 'Inorder',
  postorder: 'Postorder',
  levelorder: 'Level order',
};
const rules: Record<TreeOrder, string> = {
  preorder: 'Visit the node, then its left subtree, then its right subtree.',
  inorder: 'Visit the left subtree, then the node, then its right subtree.',
  postorder: 'Visit the left subtree, then the right subtree, then the node.',
  levelorder: 'Visit each level from left to right using a queue.',
};

export default function TreeTraversal() {
  const [draft, setDraft] = React.useState(examples['Balanced tree']);
  const [root, setRoot] = React.useState<TreeNode | null>(() =>
    parseTree(examples['Balanced tree']),
  );
  const [order, setOrder] = React.useState<TreeOrder>('inorder');
  const [index, setIndex] = React.useState(-1);
  const [error, setError] = React.useState('');
  const steps = traverseTree(root, order);
  const visited = steps.slice(0, index + 1);
  const all = traverseTree(root, 'inorder');
  const positions = new Map<number, { x: number; y: number }>();
  let maxDepth = 0;
  const place = (node: TreeNode | null, depth: number) => {
    if (!node) return;
    maxDepth = Math.max(maxDepth, depth);
    const position = all.findIndex((n) => n.id === node.id);
    positions.set(node.id, { x: ((position + 1) * 720) / (all.length + 1), y: 45 + depth * 75 });
    place(node.left, depth + 1);
    place(node.right, depth + 1);
  };
  place(root, 0);
  const height = Math.max(230, (maxDepth + 1) * 75 + 20);
  const apply = (source: string) => {
    try {
      setRoot(parseTree(source));
      setDraft(source);
      setIndex(-1);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the tree.');
    }
  };
  return (
    <ToolPanel aria-labelledby="tree-tool-title">
      <h2 id="tree-tool-title">Choose a tree and a traversal order</h2>
      <Buttons>
        {Object.entries(examples).map(([name, value]) => (
          <button key={name} onClick={() => apply(value)}>
            {name}
          </button>
        ))}
      </Buttons>
      <Controls>
        <label htmlFor="tree-input">
          Level-order input (JSON)
          <input id="tree-input" value={draft} onChange={(e) => setDraft(e.target.value)} />
        </label>
        <label htmlFor="tree-order">
          Traversal order
          <select
            id="tree-order"
            value={order}
            onChange={(e) => {
              setOrder(e.target.value as TreeOrder);
              setIndex(-1);
            }}
          >
            {Object.entries(names).map(([value, name]) => (
              <option value={value} key={value}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </Controls>
      <Buttons>
        <button onClick={() => apply(draft)}>Apply tree</button>
        <button onClick={() => setIndex((n) => n - 1)} disabled={index < 0}>
          Previous
        </button>
        <button onClick={() => setIndex((n) => n + 1)} disabled={index >= steps.length - 1}>
          Next node
        </button>
        <button
          onClick={() => setIndex(steps.length - 1)}
          disabled={!steps.length || index === steps.length - 1}
        >
          Complete traversal
        </button>
        <button onClick={() => setIndex(-1)} disabled={index < 0}>
          Reset steps
        </button>
      </Buttons>
      {error && <ErrorText role="alert">{error}</ErrorText>}
      <p>
        {rules[order]} Values are labels: this tool draws an ordinary binary tree and does not
        assume it is a binary search tree.
      </p>
      <p className="diagram-help">
        Scroll the drawing horizontally on a narrow screen. The text output below gives the same
        results.
      </p>
      {root ? (
        <Diagram tabIndex={0} role="region" aria-label="Scrollable tree diagram">
          <svg
            viewBox={`0 0 720 ${height}`}
            role="img"
            aria-labelledby="tree-drawing-title tree-drawing-description"
          >
            <title id="tree-drawing-title">{names[order]} traversal of a binary tree</title>
            <desc id="tree-drawing-description">
              {all.length} nodes. Visited values:{' '}
              {visited.map((node) => node.value).join(', ') || 'none'}. The current node is blue and
              previously visited nodes are yellow.
            </desc>
            {all.flatMap((node) =>
              [node.left, node.right]
                .filter((child): child is TreeNode => !!child)
                .map((child) => {
                  const from = positions.get(node.id)!;
                  const to = positions.get(child.id)!;
                  return (
                    <line
                      key={`${node.id}-${child.id}`}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="#7d8595"
                      strokeWidth="2"
                    />
                  );
                }),
            )}
            {all.map((node) => {
              const point = positions.get(node.id)!;
              const seen = visited.some((v) => v.id === node.id);
              const current = steps[index]?.id === node.id;
              return (
                <g key={node.id}>
                  <title>{String(node.value)}</title>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="22"
                    fill={current ? '#89c2ff' : seen ? '#ffda70' : '#30353f'}
                    stroke="#929aa8"
                  />
                  <text
                    x={point.x}
                    y={point.y + 5}
                    textAnchor="middle"
                    fill={seen ? '#15171c' : '#f0f2f6'}
                    fontSize={String(node.value).length > 5 ? '9' : '14'}
                  >
                    {String(node.value).length > 8
                      ? `${String(node.value).slice(0, 7)}…`
                      : node.value}
                  </text>
                </g>
              );
            })}
          </svg>
        </Diagram>
      ) : (
        <p role="status">An empty tree has no nodes to visit. Apply an example to start.</p>
      )}
      <p aria-live="polite">
        Visited {index + 1} of {steps.length} nodes.
      </p>
      <p>
        Traversal output:{' '}
        <output>{visited.map((node) => node.value).join(' → ') || 'None yet'}</output>
      </p>
      <p>
        Input uses a compact level-order queue. Each existing node takes the next two entries as its
        children. Use null for a missing child; missing children do not consume their own child
        entries. Node identities are separate from values, so repeated labels remain separate nodes.
      </p>
    </ToolPanel>
  );
}
