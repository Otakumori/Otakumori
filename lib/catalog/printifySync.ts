import { Prisma } from '@prisma/client';
import { db } from '@/app/lib/db';
import type { PrintifyProduct } from '@/app/lib/printify/service';
import { type PrintifySyncResult } from '@/app/lib/printify/service';
import { integrationRef, normalizeCategorySlug } from '@/lib/catalog/mapPrintify';
import { env } from '@/env/server';

type SyncOptions = {
  hideMissing?: boolean;
};

type OptionValue = {
  option: string;
  value: string;
  colors?: string[];
};

function buildOptionValueMap(product: PrintifyProduct) {
  const map = new Map<number, OptionValue>();

  for (const option of product.options ?? []) {
    for (const optionValue of option.values ?? []) {
      map.set(optionValue.id, {
        option: option.name,
        value: optionValue.title,
        colors: optionValue.colors,
      });
    }
  }

  return map;
}

function resolveVariantOptionValues(
  product: PrintifyProduct,
  variantOptions: number[] | undefined,
): OptionValue[] {
  if (!variantOptions || variantOptions.length === 0) {
    return [];
  }

  const optionValueMap = buildOptionValueMap(product);
  return variantOptions
    .map((optionId) => optionValueMap.get(optionId))
    .filter((value): value is OptionValue => Boolean(value));
}

function resolveVariantPreviewImage(product: PrintifyProduct, variantId: number): string | null {
  const match = product.images?.find((image) => image.variant_ids?.includes(variantId));
  if (match?.src) {
    return match.src;
  }
  const defaultImage = product.images?.find((image) => image.is_default);
  if (defaultImage?.src) {
    return defaultImage.src;
  }
  return product.images?.[0]?.src ?? null;
}

type PrismaClientOrTransaction = Prisma.TransactionClient | typeof db;

async function syncProductRecord(
  tx: PrismaClientOrTransaction,
  product: PrintifyProduct,
): Promise<string> {
  const categorySlug = normalizeCategorySlug(product);
  const productIntegrationRef = integrationRef(env.PRINTIFY_SHOP_ID, String(product.id));
  const defaultImage = product.images?.find((img) => img.is_default) ?? product.images?.[0] ?? null;
  const primaryImageUrl = defaultImage?.src ?? null;
  const specs = {
    safetyInformation: product.safety_information ?? null,
    salesChannelProperties: product.sales_channel_properties ?? null,
    views: product.views ?? null,
  };

  const upserted = await tx.product.upsert({
    where: { printifyProductId: String(product.id) },
    update: {
      name: product.title,
      description: product.description ?? null,
      primaryImageUrl,
      category: product.tags?.[0] ?? null,
      categorySlug,
      active: product.visible ?? true,
      visible: product.visible ?? true,
      blueprintId: product.blueprint_id ?? null,
      printProviderId: product.print_provider_id ?? null,
      tags: product.tags ?? [],
      options: product.options ?? [],
      specs,
      integrationRef: productIntegrationRef,
      lastSyncedAt: new Date(),
    },
    create: {
      name: product.title,
      description: product.description ?? null,
      primaryImageUrl,
      category: product.tags?.[0] ?? null,
      categorySlug,
      active: product.visible ?? true,
      visible: product.visible ?? true,
      blueprintId: product.blueprint_id ?? null,
      printProviderId: product.print_provider_id ?? null,
      tags: product.tags ?? [],
      options: product.options ?? [],
      specs,
      integrationRef: productIntegrationRef,
      printifyProductId: String(product.id),
      lastSyncedAt: new Date(),
    },
  });

  const incomingImages = new Set<string>();
  const images = product.images ?? [];
  const imageOperations = images
    .map((image, index) => {
      if (!image?.src) return null;
      incomingImages.add(image.src);
      return tx.productImage.upsert({
        where: {
          productId_url: {
            productId: upserted.id,
            url: image.src,
          },
        },
        update: {
          position: index,
          variantIds: image.variant_ids ?? [],
          isDefault: image.is_default ?? false,
        },
        create: {
          productId: upserted.id,
          url: image.src,
          position: index,
          variantIds: image.variant_ids ?? [],
          isDefault: image.is_default ?? false,
        },
      });
    })
    .filter((operation): operation is ReturnType<typeof tx.productImage.upsert> => Boolean(operation));

  if (imageOperations.length > 0) {
    await Promise.all(imageOperations);
  }

  if (incomingImages.size > 0) {
    await tx.productImage.deleteMany({
      where: {
        productId: upserted.id,
        url: { notIn: Array.from(incomingImages) },
      },
    });
  }

  const variants = product.variants ?? [];
  const incomingVariantIds = new Set<number>(variants.map((variant) => variant.id));

  if (variants.length > 0) {
    await Promise.all(
      variants.map(async (variant) => {
        const optionValues = resolveVariantOptionValues(product, variant.options);
        const variantCostValue = (variant as { cost?: number }).cost;
        const variantCost = typeof variantCostValue === 'number' ? variantCostValue : null;
        const previewImageUrl = resolveVariantPreviewImage(product, variant.id);
        const printProviderName = upserted.printProviderId ? String(upserted.printProviderId) : null;
        const updateData = {
          previewImageUrl,
          printProviderName,
          title: variant.title ?? null,
          sku: variant.sku ?? null,
          grams: variant.grams ?? null,
          priceCents: variant.price ?? null,
          isEnabled: variant.is_enabled ?? true,
          inStock: variant.is_available ?? true,
          currency: 'USD',
          isDefaultVariant: variant.is_default ?? false,
          optionValues,
          costCents: variantCost,
          lastSyncedAt: new Date(),
        };

        try {
          await tx.productVariant.update({
            where: {
              productId_printifyVariantId: {
                productId: upserted.id,
                printifyVariantId: variant.id,
              },
            },
            data: updateData,
          });
        } catch (variantError) {
          if (
            variantError instanceof Prisma.PrismaClientKnownRequestError &&
            variantError.code === 'P2025'
          ) {
            await tx.productVariant.create({
              data: {
                productId: upserted.id,
                previewImageUrl,
                printifyVariantId: variant.id,
                printProviderName,
                title: variant.title ?? null,
                sku: variant.sku ?? null,
                grams: variant.grams ?? null,
                isEnabled: variant.is_enabled ?? true,
                inStock: variant.is_available ?? true,
                priceCents: variant.price ?? null,
                currency: 'USD',
                isDefaultVariant: variant.is_default ?? false,
                optionValues,
                costCents: variantCost,
                lastSyncedAt: new Date(),
              },
            });
          } else {
            throw variantError;
          }
        }
      }),
    );
  }

  if (incomingVariantIds.size > 0) {
    await tx.productVariant.updateMany({
      where: {
        productId: upserted.id,
        printifyVariantId: { notIn: Array.from(incomingVariantIds) },
      },
      data: {
        isEnabled: false,
        inStock: false,
      },
    });
  }

  return upserted.id;
}

export async function syncPrintifyProducts(
  products: PrintifyProduct[],
  options: SyncOptions = {},
): Promise<PrintifySyncResult> {
  const stats: PrintifySyncResult = {
    upserted: 0,
    hidden: 0,
    count: products.length,
    errors: [],
    lastSync: new Date().toISOString(),
  };

  const incomingIds = new Set<string>();

  for (const product of products) {
    try {
      const internalId = await syncProductRecord(db, product);
      incomingIds.add(String(product.id));

      // Keep primary image fresh
      if (product.images && product.images.length > 0) {
        const defaultImage = product.images.find((img) => img.is_default) ?? product.images[0];
        if (defaultImage?.src) {
          await db.product.update({
            where: { id: internalId },
            data: { primaryImageUrl: defaultImage.src },
          });
        }
      }
      stats.upserted += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      stats.errors.push(`Product ${product.id}: ${message}`);
    }
  }

  if (options.hideMissing) {
    const existingProducts = await db.product.findMany({
      where: {
        printifyProductId: { not: null },
      },
      select: {
        id: true,
        printifyProductId: true,
      },
    });

    const toHide = existingProducts
      .filter(
        (record) =>
          record.printifyProductId && !incomingIds.has(String(record.printifyProductId)),
      )
      .map((record) => record.id);

    if (toHide.length > 0) {
      await db.product.updateMany({
        where: { id: { in: toHide } },
        data: { active: false, visible: false },
      });
      stats.hidden = toHide.length;
    }
  }

  return stats;
}

export async function syncSinglePrintifyProduct(product: PrintifyProduct) {
  await syncProductRecord(db, product);
}

