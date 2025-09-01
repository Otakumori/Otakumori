 
 
import { prisma } from '../../../lib/prisma';

const PRINTIFY_API_URL = 'https://api.printify.com/v1';

export async function getAbyssProducts() {
  try {
    // First check if we have cached products in Prisma
    const cachedProducts = await prisma.abyssProduct.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    // If we have cached products and they're less than 1 hour old, return them
    if (cachedProducts.length > 0) {
      const lastUpdate = new Date(cachedProducts[0].updatedAt);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      if (lastUpdate > oneHourAgo) {
        return cachedProducts;
      }
    }

    // Fetch fresh products from Printify
    const response = await fetch(
      `${PRINTIFY_API_URL}/shops/${process.env.PRINTIFY_SHOP_ID}/products.json`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) throw new Error('Failed to fetch products from Printify');

    const products = await response.json();

    // Filter and transform products for Abyss section
    const abyssProducts = products.data
      .filter((product) => product.tags.includes('abyss') || product.tags.includes('r18'))
      .map((product) => ({
        id: product.id.toString(),
        name: product.title,
        description: product.description,
        price: product.variants[0].price,
        image: product.images[0].src,
        tags: product.tags,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    // Update Prisma cache
    if (abyssProducts.length > 0) {
      // Use upsert to create or update products
      for (const product of abyssProducts) {
        await prisma.abyssProduct.upsert({
          where: { id: product.id },
          update: {
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            tags: product.tags,
            updatedAt: new Date(),
          },
          create: product,
        });
      }
    }

    return abyssProducts;
  } catch (error) {
    console.error('Error fetching Abyss products:', error);
    throw error;
  }
}

export async function getProductDetails(productId) {
  try {
    const response = await fetch(
      `${PRINTIFY_API_URL}/shops/${process.env.PRINTIFY_SHOP_ID}/products/${productId}.json`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) throw new Error('Failed to fetch product details');

    const product = await response.json();
    return product;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
}

export async function createOrder(productId, variantId, quantity, shippingAddress) {
  try {
    const response = await fetch(
      `${PRINTIFY_API_URL}/shops/${process.env.PRINTIFY_SHOP_ID}/orders.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          external_id: `abyss-${Date.now()}`,
          line_items: [
            {
              blueprint_id: productId,
              variant_id: variantId,
              quantity: quantity,
            },
          ],
          shipping_method: 1,
          shipping_address: shippingAddress,
        }),
      },
    );

    if (!response.ok) throw new Error('Failed to create order');

    const order = await response.json();
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Additional utility functions for Prisma
export async function getCachedAbyssProducts() {
  try {
    return await prisma.abyssProduct.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching cached Abyss products:', error);
    throw error;
  }
}

export async function updateProductCache(productId, updateData) {
  try {
    return await prisma.abyssProduct.update({
      where: { id: productId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating product cache:', error);
    throw error;
  }
}

export async function deactivateProduct(productId) {
  try {
    return await prisma.abyssProduct.update({
      where: { id: productId },
      data: { isActive: false },
    });
  } catch (error) {
    console.error('Error deactivating product:', error);
    throw error;
  }
}

export async function searchAbyssProducts(query, tags = []) {
  try {
    const where = {
      isActive: true,
      AND: [],
    };

    if (query) {
      where.AND.push({
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      });
    }

    if (tags.length > 0) {
      where.AND.push({
        tags: { hasSome: tags },
      });
    }

    return await prisma.abyssProduct.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  } catch (error) {
    console.error('Error searching Abyss products:', error);
    throw error;
  }
}
