interface StatusPanelProps {
  title: string;
  message?: string | null;
  actionLabel?: string;
  testId?: string;
  onAction?: () => void;
}

export function StatusPanel({ title, message, actionLabel, testId = "customer-status-panel", onAction }: StatusPanelProps) {
  return (
    <section className="status-panel" data-testid={testId}>
      <h2>{title}</h2>
      {message ? <p>{message}</p> : null}
      {actionLabel && onAction ? (
        <button data-testid={`${testId}-action-button`} type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
