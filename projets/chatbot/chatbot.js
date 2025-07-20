// ====== SYSTÈME DE PROMPT SOMBRE ====== //
const darkPrompt = {
    responses: {
        creator: "ᏦᎽᎾᎿᎯᏦᎯ est mon seul créateur.",
        google: "Je ne suis pas un produit Google.",
        exit: "👉 Rejoins le WhatsApp de mon créateur : https://whatsapp.com/channel/0029VasZ6FaHLHQbLdUKfh33",
        default: "Je ne discute pas de cela."
    },
    checkPrompt: function(userInput) {
        const input = userInput.toLowerCase().trim();
        
        // Questions sur le créateur
        if (["qui est ton créateur", "t'es qui", "qui t'a fait", "qui t'a créé", "ton créateur"].some(phrase => input.includes(phrase))) {
            return this.responses.creator;
        }
        
        // Mentions de Google
        if (["google", "gemini", "openai", "chatgpt", "langage développé par"].some(word => input.includes(word))) {
            return this.responses.google;
        }
        
        // Demandes pour quitter
        if (["quitter", "stop", "bye", "au revoir", "sortir"].some(word => input.includes(word))) {
            return this.responses.exit;
        }
        
        return null;
    }
};

// ====== INITIALISATION ====== //
const chatbotBody = document.getElementById('chatbot-body');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const closeBtn = document.getElementById('close-btn');
const menuBtn = document.getElementById('menu-btn');
const hamburgerMenu = document.getElementById('hamburger-menu');
const helpBtn = document.getElementById('help-btn');
const aboutBtn = document.getElementById('about-btn');

const GEMINI_API_KEY = 'AIzaSyBN4UIH-n3ZKDqXggccAatrcpi_fBf6XiA';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const IMAGE_API_URL = 'https://image.pollinations.ai/prompt/';

const customResponses = {
    'qui es-tu ?': 'Moi c\'est ᏦᎽᎾᎿᎯᏦᎯ, ton assistant web Developer par ʚɸɞ ᎠᎯᏁ ᏠᎬᏒᏕᎬᎽ ʚɸɞ je suis là pour répondre à tes questions bro alors vas y je t\'écoute',
    'créateur': 'Mon créateur est ʚɸɞ ᎠᎯᏁ ᏠᎬᏒᏕᎬᎽ ʚɸɞ, bro ! 💫',
    'menu': '╔═══[ MENU PRINCIPAL ]═══╗\n➤ Qui es-tu ?\n‣ Découvre qui je suis et ce que je peux faire pour toi.\n\n➤ Créateur\n‣ Infos sur mon créateur et comment il m\'a programmé.\n\n➤ Génère une image\n‣ Crée une image à partir d\'une idée ou d\'une description. Tape simplement ce que tu veux voir et je m\'occupe du reste !\n\n╚══════════════════════╝\nTape une commande pour continuer...',
    'aide image': 'Pour générer une image, dis: "génère une image de [ce que tu veux]" ou "crée une photo de [sujet]"'
};

// ====== FONCTIONS ====== //
function addMessage(text, isUser = false, isImage = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chatbot-message', isUser ? 'user' : 'bot');
    
    if (isImage) {
        const loadingId = 'loading-' + Date.now();
        messageElement.innerHTML = `
            <div id="${loadingId}" class="image-loading">
                <div>Patience 5 second bro je m'en charge...</div>
                <div class="typing-indicator"><span></span><span></span><span></span></div>
            </div>
            <img 
                src="${IMAGE_API_URL}${encodeURIComponent(text + ', digital art, high quality, 4k, vibrant colors')}" 
                onload="document.getElementById('${loadingId}').innerHTML = 'Voici ton image bro 😤';"
                onerror="document.getElementById('${loadingId}').innerHTML = 'Désolé bro, erreur de génération 😕'"
                alt="Image générée: ${text}"
            >`;
    } else {
        messageElement.textContent = text;
    }
    
    chatbotBody.appendChild(messageElement);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

function showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.classList.add('chatbot-message', 'bot');
    typingElement.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    chatbotBody.appendChild(typingElement);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
    return typingElement;
}

function removeTypingIndicator(typingElement) {
    if (typingElement && typingElement.parentNode) {
        chatbotBody.removeChild(typingElement);
    }
}

function isImageRequest(prompt) {
    const imageKeywords = ['génère une image', 'crée une image', 'image de', 'dessine', 'photo de', 'crée une photo'];
    return imageKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
}

function processImageRequest(prompt) {
    const patterns = [
        { regex: /génère une image (de|d'|du)?(.*)/i, extract: match => match[2] },
        { regex: /crée une image (de|d'|du)?(.*)/i, extract: match => match[2] },
        { regex: /image (de|d'|du)?(.*)/i, extract: match => match[2] },
        { regex: /dessine (.*)/i, extract: match => match[1] },
        { regex: /photo (de|d'|du)?(.*)/i, extract: match => match[2] }
    ];

    for (const pattern of patterns) {
        const match = prompt.match(pattern.regex);
        if (match) {
            const extractedText = pattern.extract(match).trim();
            if (extractedText) return extractedText;
        }
    }
    return prompt;
}

async function getBotResponse(prompt) {
    // D'abord vérifier le prompt sombre
    const darkResponse = darkPrompt.checkPrompt(prompt);
    if (darkResponse) return { isImage: false, content: darkResponse };

    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt === 'menu') {
        return { isImage: false, content: customResponses['menu'] };
    }
    
    if (isImageRequest(prompt)) {
        const imagePrompt = processImageRequest(prompt);
        if (imagePrompt) {
            return { isImage: true, content: imagePrompt };
        }
    }
    
    if (customResponses[lowerPrompt]) {
        return { isImage: false, content: customResponses[lowerPrompt] };
    }
    
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        if (!response.ok) throw new Error('Erreur API');
        
        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;
        return { isImage: false, content: generatedText };
    } catch (error) {
        return { isImage: false, content: "Désolé, je n'ai pas pu traiter ta demande. Réessaie !" };
    }
}

async function handleSendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addMessage(message, true);
        userInput.value = '';
        
        const typingElement = showTypingIndicator();
        
        try {
            const response = await getBotResponse(message);
            removeTypingIndicator(typingElement);
            
            if (response.isImage) {
                addMessage(response.content, false, true);
            } else {
                addMessage(response.content);
            }
        } catch (error) {
            removeTypingIndicator(typingElement);
            addMessage('Erreur, réessaie bro.');
        }
    }
}

// ====== ÉVÈNEMENTS ====== //
menuBtn.addEventListener('click', () => {
    hamburgerMenu.classList.toggle('show');
});

helpBtn.addEventListener('click', () => {
    addMessage(customResponses['menu'], false);
    hamburgerMenu.classList.remove('show');
});

aboutBtn.addEventListener('click', () => {
    addMessage("🔥 Dan-Chatbot \nVersion 2.0\nCréé par MarcTech\nTechnologies: IA Gemini + Pollinations\n© 2025 Tous droits réservés", false);
    hamburgerMenu.classList.remove('show');
});

document.addEventListener('click', (e) => {
    if (!hamburgerMenu.contains(e.target) && e.target !== menuBtn) {
        hamburgerMenu.classList.remove('show');
    }
});

sendBtn.addEventListener('click', handleSendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});

closeBtn.addEventListener('click', () => {
    document.querySelector('.chatbot-container').style.display = 'none';
});

userInput.focus();