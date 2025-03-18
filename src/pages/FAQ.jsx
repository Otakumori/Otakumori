import ContactForm from '../../app/components/ContactForm';  // Adjust based on actual location
export default function FAQ() {
  return (
    <div className="p-8 bg-gray-800 text-white">
      <h1 className="text-3xl font-semibold mb-6">FAQ - Ask your General!</h1>
      <ContactForm />
    </div>
  );
}
