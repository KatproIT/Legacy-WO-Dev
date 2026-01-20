import { useState } from 'react';
import { X } from 'lucide-react';

interface RejectModalProps {
  onClose: () => void;
  onSubmit: (note: string) => void;
}

export default function RejectModal({ onClose, onSubmit }: RejectModalProps) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!note.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    onSubmit(note.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">REJECT FORM</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            PLEASE PROVIDE A REASON FOR REJECTING THIS FORM
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                REJECTION REASON <span className="text-red-600">*</span>
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value.toUpperCase());
                  setError('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
                style={{ textTransform: 'uppercase' }}
                placeholder="ENTER REASON FOR REJECTION..."
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error.toUpperCase()}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                REJECT FORM
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
