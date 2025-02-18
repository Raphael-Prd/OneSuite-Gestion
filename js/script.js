// script.js
console.log("JavaScript est chargé !");

// Exemple : Ajouter un message quand on clique sur le bouton
const button = document.querySelector('a[href="#services"]');
button.addEventListener('click', () => {
    alert("Vous avez cliqué sur le bouton !");
});