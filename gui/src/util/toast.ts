// utils/toast.ts

interface ToastOptions {
  type: 'success' | 'error';
  duration?: number; // Durée en millisecondes (optionnel)
}

export function showToast(message: string, options: ToastOptions = { type: 'success' }) {
  const toastContainer = document.getElementById('toast-container');

  if (!toastContainer) {
    // Si le conteneur n'existe pas, crée-le
    const newContainer = document.createElement('div');
    newContainer.id = 'toast-container';
    newContainer.style.position = 'fixed';
    newContainer.style.top = '20px';
    newContainer.style.left = '50%';
    newContainer.style.transform = 'translateX(-50%)';
    newContainer.style.zIndex = '1000'; // Pour être au-dessus des autres éléments
    document.body.appendChild(newContainer);
  }
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.backgroundColor = options.type === 'success' ? 'green' : 'red';
  toast.style.color = 'white';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '5px';
  toast.style.marginBottom = '10px';
  toast.style.textAlign = 'center';

  document.getElementById('toast-container')?.appendChild(toast);

  // Supprimer le toast après une durée spécifiée (par défaut 3 secondes)
  const duration = options.duration || 3000;
  setTimeout(() => {
    toast.remove();
  }, duration);
}
