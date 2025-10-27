import { env } from '@/env.mjs';
import { type PrintifyProduct } from './service';

// Dynamic import to avoid circular dependencies
async function getDb() {
  const { db } = await import('@/lib/db');
  return db;
}

export interface EnhancedPrintifyProduct extends PrintifyProduct {
  externalUrl: string;
  variantDetails: Array<{
    id: number;
    size?: string;
    color?: string;
    material?: string;
    externalUrl: string;
    isValidLink: boolean;
  }>;
}

export interface SyncResult {
  success: boolean;
  productsProcessed: number;
  variantsProcessed: number;
  linksValidated: number;
  errors: string[];
  timestamp: string;
}

export class EnhancedPrintifyService {
  private readonly baseUrl = 'https://api.printify.com/v1';
  private readonly shopId = env.PRINTIFY_SHOP_ID;
  private readonly apiKey = env.PRINTIFY_API_KEY;

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generate external Printify store URL for a product
   */
  generateProductUrl(productId: string): string {
    // Printify store URLs follow this pattern
    return `https://printify.com/app/products/${productId}`;
  }

  /**
   * Generate external URL for a specific variant
   */
  generateVariantUrl(productId: string, variantId: number): string {
    return `${this.generateProductUrl(productId)}?variant=${variantId}`;
  }

  /**
   * Validate that an external URL returns HTTP 200
   */
  async validateProductLink(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Enhanced product sync with external links and validation
   */
  async syncProductsWithValidation(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      productsProcessed: 0,
      variantsProcessed: 0,
      linksValidated: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    try {
      // Fetch products from Printify API
      const response = await fetch(`${this.baseUrl}/shops/${this.shopId}/products.json`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Printify API error: ${response.status} ${response.statusText}`);
      }

      const { data: products } = await response.json();

      for (const product of products) {
        try {
          await this.processProduct(product, result);
        } catch (error) {
          const errorMsg = `Failed to process product ${product.id}: ${error instanceof Error ? error.message : String(error)}`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      result.errors.push(errorMsg);
      console.error('Printify sync failed:', error);
      return result;
    }
  }

  /**
   * Process a single product with enhanced variant mapping
   */
  private async processProduct(product: any, result: SyncResult): Promise<void> {
    const externalUrl = this.generateProductUrl(product.id);
    const isValidLink = await this.validateProductLink(externalUrl);

    if (isValidLink) {
      result.linksValidated++;
    }

    // Enhanced category mapping
    const category = this.mapProductCategory(product);
    const subcategory = this.mapProductSubcategory(product);

    // Upsert product with external URL
    const db = await getDb();
    await db.product.upsert({
      where: { id: String(product.id) },
      update: {
        name: product.title,
        description: product.description || '',
        category: `${category}:${subcategory}`,
        primaryImageUrl: product.images?.[0]?.src || null,
        active: product.visible && isValidLink, // Only active if link is valid
        printifyProductId: String(product.id),
        externalUrl,
      },
      create: {
        id: String(product.id),
        name: product.title,
        description: product.description || '',
        category: `${category}:${subcategory}`,
        primaryImageUrl: product.images?.[0]?.src || null,
        active: product.visible && isValidLink,
        printifyProductId: String(product.id),
        externalUrl,
      },
    });

    result.productsProcessed++;

    // Process variants with enhanced details
    for (const variant of product.variants || []) {
      await this.processVariant(product, variant, result);
    }
  }

  /**
   * Process a single variant with size/color extraction
   */
  private async processVariant(product: any, variant: any, result: SyncResult): Promise<void> {
    const variantUrl = this.generateVariantUrl(product.id, variant.id);
    const variantDetails = this.extractVariantDetails(product, variant);

    const db = await getDb();
    await db.productVariant.upsert({
      where: {
        productId_printifyVariantId: {
          productId: String(product.id),
          printifyVariantId: variant.id,
        },
      },
      update: {
        priceCents: Math.round(variant.price * 100),
        isEnabled: variant.is_enabled && variant.is_available,
        inStock: variant.is_available,
        size: variantDetails.size,
        color: variantDetails.color,
        material: variantDetails.material,
        externalUrl: variantUrl,
      },
      create: {
        id: `${product.id}-${variant.id}`,
        productId: String(product.id),
        printifyVariantId: variant.id,
        priceCents: Math.round(variant.price * 100),
        isEnabled: variant.is_enabled && variant.is_available,
        inStock: variant.is_available,
        size: variantDetails.size,
        color: variantDetails.color,
        material: variantDetails.material,
        externalUrl: variantUrl,
      },
    });

    result.variantsProcessed++;
  }

  /**
   * Extract size, color, and material from variant options
   */
  private extractVariantDetails(
    product: any,
    variant: any,
  ): {
    size?: string;
    color?: string;
    material?: string;
  } {
    const details: { size?: string; color?: string; material?: string } = {};

    // Map variant options to product options
    if (product.options && variant.options) {
      for (let i = 0; i < variant.options.length; i++) {
        const optionValueId = variant.options[i];
        const productOption = product.options[i];

        if (productOption) {
          const optionValue = productOption.values?.find((v: any) => v.id === optionValueId);

          if (optionValue) {
            const optionName = productOption.name.toLowerCase();

            if (optionName.includes('size')) {
              details.size = optionValue.title;
            } else if (optionName.includes('color') || optionName.includes('colour')) {
              details.color = optionValue.title;
            } else if (optionName.includes('material') || optionName.includes('fabric')) {
              details.material = optionValue.title;
            }
          }
        }
      }
    }

    return details;
  }

  /**
   * Enhanced category mapping with more categories
   */
  private mapProductCategory(product: any): string {
    const tags = (product.tags || []).join(' ').toLowerCase();
    const title = product.title.toLowerCase();
    const combined = `${tags} ${title}`;

    if (
      combined.includes('shirt') ||
      combined.includes('hoodie') ||
      combined.includes('tee') ||
      combined.includes('tank') ||
      combined.includes('sweatshirt')
    ) {
      return 'apparel';
    }

    if (
      combined.includes('hat') ||
      combined.includes('cap') ||
      combined.includes('beanie') ||
      combined.includes('pin') ||
      combined.includes('badge') ||
      combined.includes('jewelry')
    ) {
      return 'accessories';
    }

    if (
      combined.includes('mug') ||
      combined.includes('cup') ||
      combined.includes('bottle') ||
      combined.includes('pillow') ||
      combined.includes('blanket') ||
      combined.includes('poster') ||
      combined.includes('canvas') ||
      combined.includes('sticker')
    ) {
      return 'home-decor';
    }

    if (
      combined.includes('phone') ||
      combined.includes('laptop') ||
      combined.includes('case') ||
      combined.includes('mouse') ||
      combined.includes('tech')
    ) {
      return 'tech';
    }

    return 'apparel'; // Default fallback
  }

  /**
   * Enhanced subcategory mapping
   */
  private mapProductSubcategory(product: any): string {
    const tags = (product.tags || []).join(' ').toLowerCase();
    const title = product.title.toLowerCase();
    const combined = `${tags} ${title}`;

    // Apparel subcategories
    if (combined.includes('hoodie') || combined.includes('sweatshirt')) return 'hoodies';
    if (combined.includes('t-shirt') || combined.includes('tee')) return 'tees';
    if (combined.includes('tank')) return 'tanks';
    if (combined.includes('long sleeve')) return 'long-sleeve';

    // Accessories subcategories
    if (combined.includes('hat') || combined.includes('cap')) return 'headwear';
    if (combined.includes('pin') || combined.includes('badge')) return 'pins';
    if (combined.includes('jewelry') || combined.includes('necklace')) return 'jewelry';

    // Home decor subcategories
    if (combined.includes('mug') || combined.includes('cup')) return 'drinkware';
    if (combined.includes('pillow') || combined.includes('cushion')) return 'pillows';
    if (combined.includes('poster') || combined.includes('print')) return 'wall-art';
    if (combined.includes('sticker') || combined.includes('decal')) return 'stickers';

    return 'other';
  }

  /**
   * Validate all product links in database
   */
  async validateAllProductLinks(): Promise<{
    total: number;
    valid: number;
    invalid: number;
    updated: number;
  }> {
    const db = await getDb();
    const products = await db.product.findMany({
      where: {
        printifyProductId: { not: null },
      },
      select: {
        id: true,
        externalUrl: true,
        active: true,
      },
    });

    let valid = 0;
    let invalid = 0;
    let updated = 0;

    for (const product of products) {
      if (product.externalUrl) {
        const isValid = await this.validateProductLink(product.externalUrl);

        if (isValid) {
          valid++;
        } else {
          invalid++;
        }

        // Update product if validation status changed
        const shouldBeActive = isValid;
        if (product.active !== shouldBeActive) {
          await db.product.update({
            where: { id: product.id },
            data: { active: shouldBeActive },
          });
          updated++;
        }
      }
    }

    return {
      total: products.length,
      valid,
      invalid,
      updated,
    };
  }
}

// Singleton instance
export const enhancedPrintifyService = new EnhancedPrintifyService();
