window.onload = function() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
        .then(response => response.json())
        .then(data => {
            const bitcoinPrice = data.bitcoin.usd;
            document.getElementById('bitcoin-price').innerText = `Prix du Bitcoin : $${bitcoinPrice}`;
        })
        .catch(error => console.error('Erreur lors de la récupération du cours du Bitcoin :', error));
};

let afficher = true; // Variable pour suivre l'état d'affichage
let index = 0; // Déclare et initialise la variable index
let messages = []; // Assure-toi que la variable messages est initialisée

// Fonction pour afficher et changer le message
function afficherInfo() {
    if (afficher && messages.length > 0) {
        const infoElement = document.getElementById('info');
        infoElement.style.animation = 'none'; // Réinitialise l'animation pour redémarrer

        setTimeout(() => {
            infoElement.textContent = messages[index]; // Change le texte
            infoElement.style.animation = ''; // Relance l'animation
            index = (index + 1) % messages.length; // Passe au message suivant en boucle
        }, 100); // Petit délai pour éviter les effets de transition indésirables
    }
}
// Charger et afficher les nouvelles
fetch('news.json')
    .then(response => response.json())
    .then(data => {
        const newsContainer = document.getElementById('news-ticker');
        let newsHtml = '';
        data.newsItems.forEach(item => {
            newsHtml += `<span>${item.title} - ${item.description}</span>`;
        });
        newsContainer.innerHTML = newsHtml;
    })
    .catch(error => console.error('Erreur lors du chargement des nouvelles :', error));


// Bouton pour masquer/afficher
document.getElementById('toggle-button').addEventListener('click', () => {
    afficher = !afficher; // Inverse l'état d'affichage
    const infoElement = document.getElementById('info');
    if (afficher) {
        document.getElementById('toggle-button').textContent = "Masquer les actualités";
        afficherInfo(); // Affiche immédiatement si réactivé
    } else {
        document.getElementById('toggle-button').textContent = "Afficher les actualités";
        infoElement.textContent = ""; // Efface le contenu
    }
})



function getCurrentDate() {
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}
document.getElementById('current-date').textContent = getCurrentDate();



    /**
    *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
    *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */
    /*
    var disqus_config = function () {
    this.page.url = index.html;  // Replace PAGE_URL with your page's canonical URL variable
    this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };
    */
    (function() { // DON'T EDIT BELOW THIS LINE
    var d = document, s = d.createElement('script');
    s.src = 'https://chrispy69111.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
    })();
