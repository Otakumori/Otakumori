export type CatalogProvider = 'internal' | 'printify' | 'merchize';

export type ProviderResolvableProduct = {
  printifyProductId?: string | null;
  integrationRef?: string | null;
};

export function resolveCatalogProvider(product: ProviderResolvableProduct): CatalogProvider {
  const integrationRef = product.integrationRef?.trim().toLowerCase() ?? null;

  if (
    product.printifyProductId ||
    integrationRef === 'printify' ||
    integrationRef?.startsWith('printify:')
  ) {
    return 'printify';
  }

  if (integrationRef === 'merchize' || integrationRef?.startsWith('merchize:')) {
    return 'merchize';
  }

  return 'internal';
}

export function providerProductRef(provider: CatalogProvider, providerProductId: string): string {
  return `${provider}:${providerProductId}`;
}
