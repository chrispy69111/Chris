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

// Fonction pour afficher les informations
function afficherInfo() {
    if (afficher && messages.length > 0) {
        document.getElementById('info').textContent = messages[index];
        index = (index + 1) % messages.length;
    }
}

// Gestion du bouton pour masquer/afficher les actualités
document.getElementById('toggle-button').addEventListener('click', () => {
    afficher = !afficher; // Inverse l'état d'affichage
    if (afficher) {
        document.getElementById('toggle-button').textContent = "Masquer les actualités";
        afficherInfo(); // Affiche immédiatement si réactivé
    } else {
        document.getElementById('toggle-button').textContent = "Afficher les actualités";
        document.getElementById('info').textContent = ""; // Efface le contenu
    }
});

// Charge les informations et configure l'intervalle
fetch('./news.json')
    .then(response => response.json())
    .then(data => {
        const categories = data.messages;
        messages = [];

        for (const categorie in categories) {
            categories[categorie].forEach(item => {
                messages.push(`${categorie} : ${item.titre}`);
            });
        }

        afficherInfo(); // Appel initial
        setInterval(afficherInfo, 15000); // Change toutes les 15 secondes
    })
    .catch(error => console.error('Erreur lors du chargement des informations:', error));




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
