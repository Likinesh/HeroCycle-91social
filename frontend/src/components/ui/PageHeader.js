export function PageHeader({ title, actionButton }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
}
