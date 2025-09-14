import { env } from '../app/lib/env';

// Clerk API sync
export async function syncClerkUsers() {
  try {
    const response = await fetch('https://api.clerk.com/v1/users', {
      headers: {
        'Authorization': `Bearer ${env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Clerk API error: ${response.status}`);
    }

    const users = await response.json();
    
    // Insert/update users in external.clerk_users
    for (const user of users.data || []) {
      await fetch(`${env.DATABASE_URL.replace('prisma+', '')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            INSERT INTO external.clerk_users (id, identifier, identifier_type, instance_id, created_at, updated_at, attrs, invitation_id, last_synced_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (id) DO UPDATE SET
              identifier = EXCLUDED.identifier,
              identifier_type = EXCLUDED.identifier_type,
              instance_id = EXCLUDED.instance_id,
              created_at = EXCLUDED.created_at,
              updated_at = EXCLUDED.updated_at,
              attrs = EXCLUDED.attrs,
              invitation_id = EXCLUDED.invitation_id,
              last_synced_at = NOW()
          `,
          variables: [
            user.id,
            user.email_addresses?.[0]?.email_address || user.username,
            'email',
            user.id,
            new Date(user.created_at),
            new Date(user.updated_at),
            JSON.stringify(user),
            user.invitation_id || null
          ]
        })
      });
    }

    return { success: true, count: users.data?.length || 0 };
  } catch (error) {
    console.error('Clerk sync error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Stripe API sync
export async function syncStripeCustomers() {
  try {
    const response = await fetch('https://api.stripe.com/v1/customers?limit=100', {
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error(`Stripe API error: ${response.status}`);
    }

    const customers = await response.json();
    
    for (const customer of customers.data || []) {
      await fetch(`${env.DATABASE_URL.replace('prisma+', '')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            INSERT INTO external.stripe_customers (id, email, name, created, currency, metadata, last_synced_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (id) DO UPDATE SET
              email = EXCLUDED.email,
              name = EXCLUDED.name,
              created = EXCLUDED.created,
              currency = EXCLUDED.currency,
              metadata = EXCLUDED.metadata,
              last_synced_at = NOW()
          `,
          variables: [
            customer.id,
            customer.email,
            customer.name,
            new Date(customer.created * 1000),
            customer.currency,
            JSON.stringify(customer.metadata)
          ]
        })
      });
    }

    return { success: true, count: customers.data?.length || 0 };
  } catch (error) {
    console.error('Stripe customers sync error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function syncStripeProducts() {
  try {
    const response = await fetch('https://api.stripe.com/v1/products?limit=100', {
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error(`Stripe API error: ${response.status}`);
    }

    const products = await response.json();
    
    for (const product of products.data || []) {
      await fetch(`${env.DATABASE_URL.replace('prisma+', '')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            INSERT INTO external.stripe_products (id, name, active, created, description, metadata, last_synced_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              active = EXCLUDED.active,
              created = EXCLUDED.created,
              description = EXCLUDED.description,
              metadata = EXCLUDED.metadata,
              last_synced_at = NOW()
          `,
          variables: [
            product.id,
            product.name,
            product.active,
            new Date(product.created * 1000),
            product.description,
            JSON.stringify(product.metadata)
          ]
        })
      });
    }

    return { success: true, count: products.data?.length || 0 };
  } catch (error) {
    console.error('Stripe products sync error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Printify API sync
export async function syncPrintifyProducts() {
  try {
    const response = await fetch(`https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products.json`, {
      headers: {
        'Authorization': `Bearer ${env.PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.status}`);
    }

    const products = await response.json();
    
    for (const product of products.data || []) {
      await fetch(`${env.DATABASE_URL.replace('prisma+', '')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            INSERT INTO external.printify_products (id, title, description, created_at, visible, last_synced_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              created_at = EXCLUDED.created_at,
              visible = EXCLUDED.visible,
              last_synced_at = NOW()
          `,
          variables: [
            product.id.toString(),
            product.title,
            product.description,
            new Date(product.created_at),
            product.visible
          ]
        })
      });
    }

    return { success: true, count: products.data?.length || 0 };
  } catch (error) {
    console.error('Printify products sync error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Sync all external data
export async function syncAllExternalData() {
  const results = {
    clerk: await syncClerkUsers(),
    stripeCustomers: await syncStripeCustomers(),
    stripeProducts: await syncStripeProducts(),
    printifyProducts: await syncPrintifyProducts(),
  };

  return results;
}
