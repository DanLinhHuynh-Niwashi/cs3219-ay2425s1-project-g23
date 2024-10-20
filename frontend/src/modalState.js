// src/modalState.js
import { useState } from 'react';

let setModalState; // Function to update modal state

export const useModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  setModalState = setIsModalOpen; // Expose the function to update state

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return {
    isModalOpen,
    openModal,
    closeModal,
  };
};

// This function can be imported directly to open the modal from any component
export const triggerModalOpen = () => {
  if (setModalState) {
    setModalState(true);
  }
};

export const triggerModalClose = () => {
  if (setModalState) {
    setModalState(false);
  }
};
