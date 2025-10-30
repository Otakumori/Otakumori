import { getPrintifyService, type PrintifyProduct } from './service';

export type ValidationIssueType = 'image_url' | 'variant_availability' | 'metadata';

export interface ValidationIssue {
  productId: string;
  sku?: string;
  type: ValidationIssueType;
  message: string;
  reference?: string;
}

export interface ValidationSummary {
  productsChecked: number;
  issueCount: number;
  invalidProductCount: number;
  issues: ValidationIssue[];
  checkedAt: string;
}

function isValidHttpsUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

class EnhancedPrintifyService {
  constructor(private readonly service = getPrintifyService()) {}

  /**
   * Validate all Printify product assets and availability, returning rich metadata.
   */
  async validateAllProductLinks(): Promise<ValidationSummary> {
    const products = await this.service.getAllProducts();
    return this.compileSummary(products);
  }

  /**
   * Perform a full product sync (fetch) with validation in one round trip.
   */
  async syncProductsWithValidation(): Promise<
    ValidationSummary & {
      syncedAt: string;
    }
  > {
    const products = await this.service.getAllProducts();
    const summary = this.compileSummary(products);
    return {
      ...summary,
      syncedAt: new Date().toISOString(),
    };
  }

  generateProductUrl(productId: string): string {
    return `https://printify.com/app/products/${productId}`;
  }

  private compileSummary(products: PrintifyProduct[]): ValidationSummary {
    const issues: ValidationIssue[] = [];

    for (const product of products) {
      issues.push(...this.validateProduct(product));
    }

    const invalidProductIds = new Set(issues.map((issue) => issue.productId));

    return {
      productsChecked: products.length,
      issueCount: issues.length,
      invalidProductCount: invalidProductIds.size,
      issues,
      checkedAt: new Date().toISOString(),
    };
  }

  private validateProduct(product: PrintifyProduct): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!Array.isArray(product.images) || product.images.length === 0) {
      issues.push({
        productId: product.id,
        type: 'metadata',
        message: 'No preview images registered for product',
      });
    } else {
      product.images.forEach((image, index) => {
        if (!isValidHttpsUrl(image.src)) {
          issues.push({
            productId: product.id,
            type: 'image_url',
            message: `Invalid image URL at index ${index}`,
            reference: image.src,
          });
        }
      });
    }

    for (const variant of product.variants ?? []) {
      if (!variant.is_enabled && variant.is_available) {
        issues.push({
          productId: product.id,
          sku: String(variant.id),
          type: 'variant_availability',
          message: 'Variant reports stock but is disabled',
        });
      }
    }

    return issues;
  }
}

export const enhancedPrintifyService = new EnhancedPrintifyService();
