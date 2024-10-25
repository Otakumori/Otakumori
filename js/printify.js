// Your Printify API key
const PRINTIFY_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjY0M2MwNTg2MTkyNTNiZmQwOWVhNGIwMTVhZjI0MmUxYzdjZmVjNDUzZWJiN2E1NDA4NTBjN2YxODY3YmEzZGIzODNlMTljOWJmZjYyNTQ4IiwiaWF0IjoxNzI5ODc3ODI0Ljk0ODQxMywibmJmIjoxNzI5ODc3ODI0Ljk0ODQxNSwiZXhwIjoxNzYxNDEzODI0Ljk0MTg1MSwic3ViIjoiMTIyOTY2NDkiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIiwidXNlci5pbmZvIl19.AvgYy4y9tOFUULQFIg8vWaMYZnLp4ePys4Bh2uIBDcIkpMKkThQCvzOuSiJo8fMGDJA2EbyXu_kXn3hvh-Y';

// Base URL for Printify API
const PRINTIFY_API_URL = 'https://api.printify.com/v1/';

// Function to fetch products
async function fetchPrintifyProducts() {
    const response = await fetch(`${PRINTIFY_API_URL}products.json`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        console.error('Error fetching products:', response.statusText);
        return [];
    }

    const products = await response.json();
    return products.data; // Adjust based on actual API response structure
}

// Call the function to fetch products and log them
fetchPrintifyProducts().then(products => {
    console.log('Fetched Products:', products);
});
