import * as React from 'react';
import styled from 'styled-components';

const Lab = styled.section`
  margin: 24px 0;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 6px;
  min-width: 0;
  button,
  input {
    font: inherit;
  }
  button {
    min-height: 44px;
    padding: 10px 14px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 4px;
    background: ${({ theme }) => theme.color.backgroundPrimary};
    color: inherit;
    cursor: pointer;
  }
  button:focus-visible,
  [role='tabpanel']:focus-visible,
  input:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.brand};
    outline-offset: 3px;
  }
  [role='tablist'] {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
  [aria-selected='true'] {
    border-color: ${({ theme }) => theme.color.brand};
    font-weight: 700;
  }
  [role='tabpanel'] {
    margin-top: 20px;
    line-height: 1.8;
  }
  [hidden] {
    display: none;
  }
  .lab-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 16px 0;
  }
  @media (max-width: 480px) {
    padding: 14px;
    button {
      padding: 10px 8px;
    }
  }
`;
const Dialog = styled.dialog`
  width: min(480px, calc(100% - 32px));
  max-height: calc(100% - 48px);
  overflow: auto;
  box-sizing: border-box;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.color.backgroundPrimary};
  color: ${({ theme }) => theme.color.textPrimary};
  &::backdrop {
    background: rgba(0, 0, 0, 0.65);
  }
  label {
    display: block;
    margin: 16px 0 8px;
  }
  input {
    width: 100%;
    min-height: 44px;
    box-sizing: border-box;
    background: transparent;
    color: inherit;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 4px;
    padding: 8px;
  }
  h3 {
    margin-top: 0;
  }
`;

export default function AccessibleComponents() {
  const [selected, setSelected] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [lastAction, setLastAction] = React.useState('No dialog action yet.');
  const tabs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const dialog = React.useRef<HTMLDialogElement>(null);
  const opener = React.useRef<HTMLButtonElement>(null);
  const note = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const closed = () => {
      setLastAction(element.returnValue === 'confirmed' ? 'Dialog confirmed.' : 'Dialog canceled.');
      opener.current?.focus();
    };
    element.addEventListener('close', closed);
    return () => element.removeEventListener('close', closed);
  }, []);
  const labels = ['Tabs', 'Modal', 'State'];
  const keyDown = (event: React.KeyboardEvent, index: number) => {
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % labels.length
        : event.key === 'ArrowLeft'
          ? (index + labels.length - 1) % labels.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? labels.length - 1
              : null;
    if (next !== null) {
      event.preventDefault();
      tabs.current[next]?.focus();
    }
  };
  return (
    <Lab aria-label="Accessible component practice">
      <h2>Try the components</h2>
      <p>
        Use Left and Right Arrow, Home, or End within the tab list. Tab moves into the selected
        panel.
      </p>
      <div role="tablist" aria-label="Frontend component examples" aria-orientation="horizontal">
        {labels.map((label, index) => (
          <button
            key={label}
            id={`component-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={selected === index}
            aria-controls={`component-panel-${index}`}
            tabIndex={selected === index ? 0 : -1}
            ref={(element) => {
              tabs.current[index] = element;
            }}
            onFocus={() => setSelected(index)}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => keyDown(event, index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id="component-panel-0"
        aria-labelledby="component-tab-0"
        tabIndex={0}
        hidden={selected !== 0}
      >
        <h3>Follow focus and selection</h3>
        <p>
          Only one tab is in the page’s Tab sequence. Arrow keys move focus and activate a panel
          immediately because all three panels are already available. Inactive panels stay hidden
          from ordinary reading and keyboard navigation.
        </p>
        <p>
          Move to State, press Home to return here, then press Tab. Focus should enter this panel
          rather than visit every inactive tab.
        </p>
      </div>
      <div
        role="tabpanel"
        id="component-panel-1"
        aria-labelledby="component-tab-1"
        tabIndex={0}
        hidden={selected !== 1}
      >
        <h3>Open, use, and close a modal</h3>
        <p>
          The native modal dialog keeps background controls inert. Try Tab, Shift+Tab, Escape, and
          the explicit close button, then check where focus returns.
        </p>
        <button
          ref={opener}
          type="button"
          onClick={() => {
            if (dialog.current) {
              dialog.current.returnValue = '';
              dialog.current.showModal();
              note.current?.focus();
            }
          }}
        >
          Open practice dialog
        </button>
        <p role="status">{lastAction}</p>
      </div>
      <div
        role="tabpanel"
        id="component-panel-2"
        aria-labelledby="component-tab-2"
        tabIndex={0}
        hidden={selected !== 2}
      >
        <h3>Predict queued state updates</h3>
        <p>
          Each button queues three updates in one event handler. Predict the resulting count before
          trying each version.
        </p>
        <p role="status">Count: {count}</p>
        <div className="lab-actions">
          <button
            type="button"
            onClick={() => {
              setCount(count + 1);
              setCount(count + 1);
              setCount(count + 1);
            }}
          >
            Three snapshot updates
          </button>
          <button
            type="button"
            onClick={() => {
              setCount((value) => value + 1);
              setCount((value) => value + 1);
              setCount((value) => value + 1);
            }}
          >
            Three updater functions
          </button>
          <button type="button" onClick={() => setCount(0)}>
            Reset count
          </button>
        </div>
        <p>
          The snapshot version requests the same replacement three times. Updater functions each
          receive the preceding queued result.
        </p>
      </div>
      <Dialog
        ref={dialog}
        aria-labelledby="component-dialog-title"
        aria-describedby="component-dialog-description"
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'input:not([disabled]), button:not([disabled])',
            ),
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <h3 id="component-dialog-title">Practice dialog</h3>
        <p id="component-dialog-description">
          Enter any short note to try focus movement. Confirming closes the dialog; this exercise
          does not save the note.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            dialog.current?.close('confirmed');
          }}
        >
          <label htmlFor="component-dialog-note">Practice note</label>
          <input id="component-dialog-note" ref={note} maxLength={120} />
          <div className="lab-actions">
            <button type="submit">Confirm</button>
            <button type="button" onClick={() => dialog.current?.close('canceled')}>
              Close dialog
            </button>
          </div>
        </form>
      </Dialog>
    </Lab>
  );
}
