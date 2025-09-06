// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
import SoapstoneComposer from '@/app/components/soapstone/Composer';
import SoapstoneList from '@/app/components/soapstone/List';

export default function SoapstonePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Soapstone Messages</h1>
        <p className="text-white/70 mb-6">
          Leave your mark in the digital world. Share thoughts, tips, or just say hello to fellow travelers.
        </p>
      </div>
      
      <div className="space-y-8">
        <SoapstoneComposer />
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
          <SoapstoneList />
        </div>
      </div>
    </div>
  );
}
