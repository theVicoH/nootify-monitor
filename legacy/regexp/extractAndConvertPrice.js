export function extractAndConvertPrice(value) {
    const amountRegex = /(\d+(?:\.\d{1,2})?)/;
    const currencySymbolRegex = /(€|EUR|\$|USD|£|GBP|¥|JPY|₹|INR|₽|RUB|₩|KRW|฿|THB|₺|TRY|R\$|BRL|CHF|SEK|AUD|CAD|NZD|DKK|NOK|SGD|HKD|MXN|PLN|ZAR|AED|CNY)/i;
    const currencyMap = {
        '€': 'EUR', // Euro
        '$': 'USD', // US Dollar
        '£': 'GBP', // British Pound Sterling
        '¥': 'JPY', // Japanese Yen
        '₹': 'INR', // Indian Rupee
        '₽': 'RUB', // Russian Ruble
        '₩': 'KRW', // South Korean Won
        '฿': 'THB', // Thai Baht
        '₺': 'TRY', // Turkish Lira
        'R$': 'BRL', // Brazilian Real
        'CHF': 'CHF', // Swiss Franc
        'SEK': 'SEK', // Swedish Krona
        'AUD': 'AUD', // Australian Dollar
        'CAD': 'CAD', // Canadian Dollar
        'NZD': 'NZD', // New Zealand Dollar
        'DKK': 'DKK', // Danish Krone
        'NOK': 'NOK', // Norwegian Krone
        'SGD': 'SGD', // Singapore Dollar
        'HKD': 'HKD', // Hong Kong Dollar
        'MXN': 'MXN', // Mexican Peso
        'PLN': 'PLN', // Polish Złoty
        'ZAR': 'ZAR', // South African Rand
        'AED': 'AED', // United Arab Emirates Dirham
        'CNY': 'CNY', // Chinese Yuan
        'INR': 'INR', // Indian Rupee
        'JPY': 'JPY', // Japanese Yen 
        'RUB': 'RUB', // Russian Ruble 
        'TRY': 'TRY', // Turkish Lira 
        'BRL': 'BRL', // Brazilian Real 
    };
    //const currencySymbolRegexPattern = `(\\${Object.keys(currencyMap).join('|\\')})`;
    // Create the regex using the pattern and the 'i' flag for case-insensitive matching
    //const currencySymbolRegex = new RegExp(currencySymbolRegexPattern, 'i');

    const amountMatch = value.match(amountRegex);
    const currencySymbolMatch = value.match(currencySymbolRegex);

    let amount = 0;
    let currency = "EUR";

    if (amountMatch) {
        // Replace "_ _ " by spaces for parseFloat works
        const amountString = amountMatch[0].replace(/_ /g, "");
        amount = parseFloat(amountString);
    }
    if (currencySymbolMatch) {
        const currencySymbol = currencySymbolMatch[0];
        currency = currencyMap[currencySymbol] || currencySymbol;
    }
    return { amount, currency };
}