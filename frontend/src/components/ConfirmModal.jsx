import { useState } from 'react';

export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="card w-full max-w-sm space-y-4">
        <h2 id="modal-title" className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-ink/80">{message}</p>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// const [modal, ask] = useConfirm();  ask({ title, message, confirmLabel, onConfirm });  render {modal}
export function useConfirm() {
  const [state, setState] = useState(null);
  const modal = state && (
    <ConfirmModal
      {...state}
      onCancel={() => setState(null)}
      onConfirm={async () => {
        const action = state.onConfirm;
        setState(null);
        await action();
      }}
    />
  );
  return [modal, setState];
}