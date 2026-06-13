import React from 'react';
import Modal from './Modal';
import { Trash2, Info } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm Delete", type = "danger" }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className={`w-16 h-16 ${type === 'danger' ? 'bg-red-50 text-error' : 'bg-primary/10 text-primary'} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {type === 'danger' ? <Trash2 size={32} className="stroke-[2.5]" /> : <Info size={32} className="stroke-[2.5]" />}
        </div>
        <p className="text-on-surface-variant font-medium mb-8 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-surface-container-high text-on-surface rounded-xl font-bold transition-all hover:bg-surface-container-highest"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-3 ${type === 'danger' ? 'bg-error text-white' : 'bg-primary text-white'} rounded-xl font-bold shadow-lg transition-all hover:opacity-90 active:scale-95`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
