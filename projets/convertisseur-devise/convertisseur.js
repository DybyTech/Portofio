document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        amount: document.getElementById('amount'),
        fromCurrency: document.getElementById('from-currency'),
        toCurrency: document.getElementById('to-currency'),
        result: document.getElementById('result'),
        swapBtn: document.getElementById('swap-btn'),
        conversionResult: document.getElementById('conversion-result'),
        rateInfo: document.getElementById('rate-info'),
        errorMessage: document.getElementById('error-message'),
        lastUpdate: document.getElementById('last-update'),
        resultDisplay: document.getElementById('result-display')
    };

    const currencies = {
        "USD": { name: "Dollar américain", flag: "🇺🇸" },
        "EUR": { name: "Euro", flag: "🇪🇺" },
        "JPY": { name: "Yen japonais", flag: "🇯🇵" },
        "GBP": { name: "Livre sterling", flag: "🇬🇧" },
        "AUD": { name: "Dollar australien", flag: "🇦🇺" },
        "CAD": { name: "Dollar canadien", flag: "🇨🇦" },
        "CHF": { name: "Franc suisse", flag: "🇨🇭" },
        "CNY": { name: "Yuan chinois", flag: "🇨🇳" },
        "MAD": { name: "Dirham marocain", flag: "🇲🇦" },
        "XOF": { name: "Franc CFA", flag: "🌍" }
    };

    let exchangeRates = {};
    let lastUpdated = null;

    const init = () => {
        populateCurrencyDropdowns();
        fetchExchangeRates();
        setupEventListeners();
    };

    const populateCurrencyDropdowns = () => {
        Object.entries(currencies).forEach(([code, {name, flag}]) => {
            const option = document.createElement('option');
            option.value = code;
            option.innerHTML = `${flag} ${code} - ${name}`;
            
            elements.fromCurrency.appendChild(option.cloneNode(true));
            elements.toCurrency.appendChild(option);
        });

        elements.fromCurrency.value = 'EUR';
        elements.toCurrency.value = 'USD';
    };

    const fetchExchangeRates = async () => {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
            const data = await response.json();
            
            if (data?.rates) {
                exchangeRates = data.rates;
                lastUpdated = new Date(data.time_last_updated * 1000);
                updateUI();
            }
        } catch (error) {
            console.error("API error:", error);
            elements.errorMessage.textContent = "Service temporairement indisponible. Taux non actualisés.";
            
            // Valeurs par défaut en cas d'erreur
            exchangeRates = {
                "USD": 1.09, "EUR": 1, "JPY": 157.47, "GBP": 0.85,
                "AUD": 1.63, "CAD": 1.47, "CHF": 0.96, "CNY": 7.83,
                "MAD": 10.91, "XOF": 655.96
            };
            lastUpdated = new Date();
            updateUI();
        }
    };

    const convertCurrency = () => {
        const amount = parseFloat(elements.amount.value);
        if (isNaN(amount) {
            resetResultDisplay();
            return;
        }

        const from = elements.fromCurrency.value;
        const to = elements.toCurrency.value;

        if (!exchangeRates[from] || !exchangeRates[to]) {
            elements.errorMessage.textContent = "Taux non disponible pour cette paire.";
            return;
        }

        elements.errorMessage.textContent = '';
        
        const amountInBase = from === 'EUR' ? amount : amount / exchangeRates[from];
        const result = to === 'EUR' ? amountInBase : amountInBase * exchangeRates[to];
        
        displayResult(amount, from, result, to);
    };

    const displayResult = (amount, from, result, to) => {
        elements.result.value = result.toFixed(4);
        elements.conversionResult.textContent = `${amount.toFixed(2)} ${from} = ${result.toFixed(4)} ${to}`;
        
        const rate = (exchangeRates[to] / exchangeRates[from]).toFixed(6);
        elements.rateInfo.textContent = `1 ${from} = ${rate} ${to}`;
        
        animateResult();
    };

    const animateResult = () => {
        elements.resultDisplay.classList.remove('fade-in');
        void elements.resultDisplay.offsetWidth;
        elements.resultDisplay.classList.add('fade-in');
    };

    const resetResultDisplay = () => {
        elements.result.value = '';
        elements.conversionResult.textContent = '-';
    };

    const swapCurrencies = () => {
        [elements.fromCurrency.value, elements.toCurrency.value] = 
        [elements.toCurrency.value, elements.fromCurrency.value];
        convertCurrency();
    };

    const updateUI = () => {
        convertCurrency();
        updateTimestamp();
    };

    const updateTimestamp = () => {
        if (lastUpdated) {
            elements.lastUpdate.textContent = `Actualisé: ${lastUpdated.toLocaleString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}`;
        }
    };

    const setupEventListeners = () => {
        elements.amount.addEventListener('input', convertCurrency);
        elements.fromCurrency.addEventListener('change', convertCurrency);
        elements.toCurrency.addEventListener('change', convertCurrency);
        elements.swapBtn.addEventListener('click', swapCurrencies);
    };

    init();
    setInterval(fetchExchangeRates, 60 * 60 * 1000); // Actualisation toutes les heures
});