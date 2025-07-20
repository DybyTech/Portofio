document.addEventListener('DOMContentLoaded', function() {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const overlay = document.getElementById('overlay');
    const welcomeBtn = document.getElementById('welcomeBtn');

    // Effet de terminal pour le message de bienvenue
    const welcomeText = welcomeMessage.querySelector('p');
    const originalText = welcomeText.innerHTML;
    welcomeText.innerHTML = '';
    
    let i = 0;
    const typingInterval = setInterval(() => {
        if (i < originalText.length) {
            welcomeText.innerHTML += originalText.charAt(i);
            i++;
        } else {
            clearInterval(typingInterval);
        }
    }, 30);

    welcomeBtn.addEventListener('click', function() {
        welcomeMessage.classList.add('closing');
        overlay.style.opacity = '0';
        
        setTimeout(() => {
            welcomeMessage.style.display = 'none';
            overlay.style.display = 'none';
        }, 500);
    });

    const realNameInput = document.getElementById('realName');
    const devNameInput = document.getElementById('devName');
    const devTitleInput = document.getElementById('devTitle');
    const ageInput = document.getElementById('age');
    const nationalityInput = document.getElementById('nationality');
    const languagesInput = document.getElementById('languages');
    const favLanguageInput = document.getElementById('favLanguage');
    const avatarInput = document.getElementById('avatar');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const blaseOptions = document.querySelectorAll('.blase-option');
    const devCard = document.getElementById('devCard');
    
    const cardRealName = document.getElementById('cardRealName');
    const cardDevName = document.getElementById('cardDevName');
    const cardDevTitle = document.getElementById('cardDevTitle');
    const cardAge = document.getElementById('cardAge');
    const cardNationality = document.getElementById('cardNationality');
    const cardFavLanguage = document.getElementById('cardFavLanguage');
    const cardLanguages = document.getElementById('cardLanguages');
    const avatarPreview = document.getElementById('avatarPreview');
    
    // Options de spécialité
    blaseOptions.forEach(option => {
        option.addEventListener('click', function() {
            blaseOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            devTitleInput.value = this.dataset.title;
        });
    });
    
    // Upload d'avatar
    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                avatarPreview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Mise à jour de la carte
    function updateCard() {
        cardRealName.textContent = realNameInput.value.trim() || 'Dan jersey';
        cardDevName.textContent = devNameInput.value.trim() || '0xDarkShadow';
        cardDevTitle.textContent = devTitleInput.value.trim() || 'Code Hacker';
        cardAge.textContent = ageInput.value || '19';
        cardNationality.textContent = nationalityInput.value.trim() || 'Dark Web';
        cardFavLanguage.textContent = favLanguageInput.value.trim() || 'Python';
        
        cardLanguages.innerHTML = '';
        const languages = languagesInput.value.split(',').map(lang => lang.trim()).filter(lang => lang);
        
        if (languages.length === 0) {
            languages.push('Python', 'Bash', 'SQL', 'C++');
        }
        
        languages.forEach(lang => {
            const isFav = lang.toLowerCase() === favLanguageInput.value.trim().toLowerCase();
            const langTag = document.createElement('span');
            langTag.className = `language-tag ${isFav ? 'primary' : ''}`;
            langTag.textContent = lang;
            cardLanguages.appendChild(langTag);
        });
        
        return true;
    }
    
    generateBtn.addEventListener('click', updateCard);
    
    // Téléchargement de la carte - Version compatible mobile
    downloadBtn.addEventListener('click', function() {
        updateCard();
        
        downloadBtn.classList.add('loading');
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        progressContainer.style.display = 'block';
        
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            if (progress >= 90) clearInterval(progressInterval);
        }, 50);
        
        // Effet de scan avant capture
        devCard.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.8)';
        setTimeout(() => {
            devCard.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.8)';
            
            // Configuration optimisée pour mobile
            html2canvas(devCard, {
                scale: 2,
                backgroundColor: null,
                logging: false,
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight
            }).then(canvas => {
                progressBar.style.width = '100%';
                
                // Méthode compatible mobile
                try {
                    if (navigator.userAgent.match(/Android|iPhone|iPad|iPod/i)) {
                        // Pour mobile - ouvre dans un nouvel onglet si nécessaire
                        const imgData = canvas.toDataURL('image/png');
                        const newTab = window.open();
                        newTab.document.write('<img src="' + imgData + '" />');
                        
                        // Alternative pour forcer le téléchargement
                        setTimeout(() => {
                            const link = document.createElement('a');
                            const fileName = `hacker-card-${devNameInput.value.trim() || 'anonymous'}.png`;
                            link.download = fileName;
                            link.href = imgData;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }, 1000);
                    } else {
                        // Pour desktop - méthode standard
                        const link = document.createElement('a');
                        const fileName = `hacker-card-${devNameInput.value.trim() || 'anonymous'}.png`;
                        link.download = fileName;
                        link.href = canvas.toDataURL('image/png');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                } catch (e) {
                    // Fallback si les autres méthodes échouent
                    const imgData = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
                    window.location.href = imgData;
                }
                
                setTimeout(() => {
                    downloadBtn.classList.remove('loading');
                    progressContainer.style.display = 'none';
                    progressBar.style.width = '0%';
                    downloadBtn.textContent = 'DOWNLOAD COMPLETE!';
                    
                    setTimeout(() => {
                        downloadBtn.textContent = 'DOWNLOAD CARD';
                    }, 2000);
                }, 500);
            }).catch(err => {
                console.error('Erreur de génération:', err);
                alert('Erreur lors du téléchargement. Essayez à nouveau.');
                downloadBtn.classList.remove('loading');
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
            });
        }, 800);
    });
    
    // Initialisation
    setTimeout(updateCard, 500);
});