import { getMerchizeService } from '@/app/lib/merchize/service';

export const dynamic = 'force-dynamic';

function formatPrice(price: number | null, currency: string | null) {
  if (price == null) return 'Price unavailable';
  if (!currency) return String(price);
  return `${price} ${currency}`;
}

export default async function MerchizeProbePage() {
  const service = getMerchizeService();
  const connection = await service.testConnection();
  const products = connection.success ? await service.getProducts() : [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Merchize Probe</h1>
        <p className="mt-2 text-sm text-white/70">
          Public provider test surface for Merchize while the rest of the admin/auth layer is being stabilized.
        </p>
      </div>

      <section className="mb-8 rounded-2xl border border-white/10 bg-black/30 p-6">
        <h2 className="text-xl font-medium">Connection status</h2>
        <div className="mt-4 space-y-2 text-sm text-white/80">
          <p><span className="font-medium">Endpoint:</span> {connection.endpoint}</p>
          <p><span className="font-medium">Reachable:</span> {connection.success ? 'Yes' : 'No'}</p>
          <p><span className="font-medium">Status:</span> {connection.status ?? 'N/A'}</p>
          <p><span className="font-medium">Detected products:</span> {connection.productCount ?? 0}</p>
          {connection.error ? (
            <p className="text-rose-300"><span className="font-medium">Error:</span> {connection.error}</p>
          ) : null}
          {connection.sampleKeys?.length ? (
            <p><span className="font-medium">Payload keys:</span> {connection.sampleKeys.join(', ')}</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-medium">Normalized products</h2>
          <p className="text-sm text-white/60">{products.length} loaded</p>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-white/70">
            No products were normalized yet. If the endpoint is live, the payload shape may need one more mapping pass.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.slice(0, 24).map((product) => (
              <article key={product.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">{product.id}</p>
                <h3 className="mt-2 text-lg font-medium">{product.title}</h3>
                <p className="mt-2 text-sm text-white/70">{formatPrice(product.price, product.currency)}</p>
                <p className="mt-2 text-sm text-white/60">{product.description || 'No description returned.'}</p>
                <p className="mt-3 text-xs text-white/45">SKU: {product.sku || 'n/a'} · Status: {product.status || 'n/a'}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
