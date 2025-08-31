import SoapstoneMessageCard from '@/components/soapstone/SoapstoneMessageCard';

export default function SoapstoneExample() {
  return (
    <div className="space-y-4 p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Soapstone Message Examples</h2>

      <SoapstoneMessageCard emphasis={0.9}>
        <p className="text-sm leading-relaxed text-white">"Praise the sun! \\[T]/"</p>
      </SoapstoneMessageCard>

      <SoapstoneMessageCard emphasis={0.7}>
        <p className="text-sm leading-relaxed text-white">"Try jumping off the cliff"</p>
      </SoapstoneMessageCard>

      <SoapstoneMessageCard emphasis={0.8}>
        <p className="text-sm leading-relaxed text-white">"Amazing chest ahead"</p>
      </SoapstoneMessageCard>
    </div>
  );
}
