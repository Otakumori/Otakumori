import ContactForm from '../../app/components/ContactForm'; // Adjust based on actual location
export default function FAQ() {
  return (
    <div className="bg-gray-800 p-8 text-white">
      <h1 className="mb-6 text-3xl font-semibold">{<><span role='img' aria-label='emoji'>F</span><span role='img' aria-label='emoji'>A</span><span role='img' aria-label='emoji'>Q</span>' '-' '<span role='img' aria-label='emoji'>A</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>k</span>' '<span role='img' aria-label='emoji'>y</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>r</span>' '<span role='img' aria-label='emoji'>G</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>l</span>!</>}</h1>
      <ContactForm />
    </div>
  );
}
