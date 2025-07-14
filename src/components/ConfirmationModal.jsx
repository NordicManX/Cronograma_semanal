import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <div className="flex items-start">
                <div className="mr-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-grow">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Confirmar Ação</h3>
                    <p className="mt-2 text-sm text-gray-500">{message}</p>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                    type="button"
                    onClick={onConfirm}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                    Confirmar
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                >
                    Cancelar
                </button>
            </div>
        </div>
    </div>
);

export default ConfirmationModal;