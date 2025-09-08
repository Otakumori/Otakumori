import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://api.printify.com/*", () => {
    return HttpResponse.json([
      { 
        id: "p1", 
        title: "Cherry Blossom Hoodie",
        description: "A beautiful hoodie with cherry blossom design",
        images: ["https://images.printify.com/hoodie1.jpg"],
        variants: [
          { id: 1, title: "Small", price: 2999, available: true },
          { id: 2, title: "Medium", price: 2999, available: true },
          { id: 3, title: "Large", price: 2999, available: true },
        ],
        tags: ["anime", "cherry-blossom", "hoodie"],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      }
    ]);
  }),
  
  // Stripe mock
  http.post("https://api.stripe.com/v1/payment_intents", () => {
    return HttpResponse.json({
      id: "pi_test_123",
      client_secret: "pi_test_123_secret_456",
      status: "requires_payment_method",
    });
  }),
  
  // Clerk mock
  http.get("https://api.clerk.com/v1/users/*", () => {
    return HttpResponse.json({
      id: "user_test_123",
      email_addresses: [{ email_address: "test@example.com" }],
      first_name: "Test",
      last_name: "User",
    });
  }),
];
