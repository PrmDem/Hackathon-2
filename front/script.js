// Fonction pour changer de page
function showPage(pageId) {
  // 1. On récupère les deux sections et les deux boutons
  const libraryPage = document.getElementById('page-library');
  const recoPage = document.getElementById('page-reco');
  const btnLib = document.getElementById('btn-lib');
  const btnReco = document.getElementById('btn-reco');

  // 2. Logique de bascule
  if (pageId === 'library') {
    // Afficher bibliothèque, cacher reco
    libraryPage.classList.remove('hidden');
    recoPage.classList.add('hidden');

    // Mettre à jour le style des boutons (Actif / Inactif)
    btnLib.classList.add('bg-indigo-700', 'opacity-100');
    btnLib.classList.remove('opacity-75');

    btnReco.classList.remove('bg-indigo-700', 'opacity-100');
    btnReco.classList.add('opacity-75');

  } else if (pageId === 'reco') {
    // Afficher reco, cacher bibliothèque
    recoPage.classList.remove('hidden');
    libraryPage.classList.add('hidden');

    // Mettre à jour le style des boutons
    btnReco.classList.add('bg-indigo-700', 'opacity-100');
    btnReco.classList.remove('opacity-75');

    btnLib.classList.remove('bg-indigo-700', 'opacity-100');
    btnLib.classList.add('opacity-75');
  }
}