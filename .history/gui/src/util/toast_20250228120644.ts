interface ToastOptions {
  type: 'success' | 'error';
  duration?: number;
  direction?: 'top' | 'bottom';
}

export function showToast(message: string, options: ToastOptions = { type: 'success', duration: 3000, direction: 'top' }) {
  const toastContainer = document.getElementById('toast-container');

  if (!toastContainer) {
    // Si le conteneur n'existe pas, crée-le
    const newContainer = document.createElement('div');
    newContainer.id = 'toast-container';
    newContainer.style.position = 'fixed';
    newContainer.style.left = '50%';
    newContainer.style.width = '300px';
    newContainer.style.transform = 'translateX(-50%)';
    newContainer.style.zIndex = '1000'; // Pour être au-dessus des autres éléments
       // Ajout de styles pour le conteneur
    newContainer.style.display = 'flex';           // Utilise flexbox pour centrer le toast
    newContainer.style.flexDirection = 'column';    // Empile les toasts verticalement
    newContainer.style.alignItems = 'center';       // Centre horizontalement les toasts
    document.body.appendChild(newContainer);
  }
  if (toastContainer) {

    // Détermine la position verticale du conteneur
    if (options.direction === 'top') {
      toastContainer.style.top = '20px';
      toastContainer.style.bottom = 'unset'; // Assurez-vous que bottom n'est pas défini
    } else {
      toastContainer.style.bottom = '20px';
      toastContainer.style.top = 'unset'; // Assurez-vous que top n'est pas défini
    }
  }
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.backgroundColor = options.type === 'success' ? 'green' : 'red';
  toast.style.color = 'white';
  toast.style.padding = '10px 10px';
  toast.style.borderRadius = '5px';
  toast.style.marginBottom = '10px';
  toast.style.textAlign = 'center';
    // Ajoute les classes pour l'animation de fondu
  // Définir la largeur maximale du toast à 80% de la largeur de l'écran
  toast.style.maxWidth = '100%';
  toast.style.width = 'fit-content'; // La largeur s'adapte au contenu, mais ne dépasse pas 80%
  toast.style.boxSizing = 'border-box'; // Important pour que le padding n'affecte pas la largeur totale
    // Ajoute les classes pour l'animation de fondu
  toast.classList.add('fade-in-out');
  document.getElementById('toast-container')?.appendChild(toast);

  // Supprimer le toast après une durée spécifiée (par défaut 3 secondes)
  const duration = options.duration || 3000;
  setTimeout(() => {
    // Déclenche l'animation de fade-out
    toast.classList.remove('fade-in-out');
    toast.classList.add('fade-out');

    // Supprime le toast après la fin de l'animation
    setTimeout(() => {
      toast.remove();
    }, 1000); // Durée de l'animation de fade-out

  }, duration);
}
