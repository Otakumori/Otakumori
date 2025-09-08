'use client';

import * as Sentry from '@sentry/nextjs';

// Add this button component to your app to test Sentry's error tracking
export default function ErrorTestButton() {
  const handleError = () => {
    throw new Error('This is your first error!');
  };

  const handleAsyncError = async () => {
    throw new Error('This is an async error!');
  };

  const handleCustomError = () => {
    Sentry.captureException(new Error('Custom error captured directly!'));
  };

  const handleMessage = () => {
    Sentry.captureMessage('Test message from ErrorTestButton', 'info');
  };

  return (
    <div className="space-y-4 p-4 border border-red-500 rounded-lg bg-red-50 dark:bg-red-900/20">
      <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">{<><span role='img' aria-label='emoji'>S</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>y</span>' '<span role='img' aria-label='emoji'>E</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span>' '<span role='img' aria-label='emoji'>T</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>g</span></>}</h3>
      <div className="space-y-2">
        <button
          onClick={handleError}
          className="block w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >{<>''
          <span role='img' aria-label='emoji'>B</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>k</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>w</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>d</span>' '(<span role='img' aria-label='emoji'>S</span><span role='img' aria-label='emoji'>y</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>c</span>' '<span role='img' aria-label='emoji'>E</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span>)
          ''</>}</button>
        <button
          onClick={handleAsyncError}
          className="block w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >{<>''
          <span role='img' aria-label='emoji'>B</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>k</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>w</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>d</span>' '(<span role='img' aria-label='emoji'>A</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>y</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>c</span>' '<span role='img' aria-label='emoji'>E</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span>)
          ''</>}</button>
        <button
          onClick={handleCustomError}
          className="block w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >{<>''
          <span role='img' aria-label='emoji'>C</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>p</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>C</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>m</span>' '<span role='img' aria-label='emoji'>E</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span>
          ''</>}</button>
        <button
          onClick={handleMessage}
          className="block w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >{<>''
          <span role='img' aria-label='emoji'>S</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>d</span>' '<span role='img' aria-label='emoji'>T</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>t</span>' '<span role='img' aria-label='emoji'>M</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>e</span>
          ''</>}</button>
      </div>
      <p className="text-sm text-red-600 dark:text-red-400">{<>''
        ⚠️' '<span role='img' aria-label='emoji'>T</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>b</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>s</span>' '<span role='img' aria-label='emoji'>w</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>l</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>r</span>' '<span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>s</span>' '<span role='img' aria-label='emoji'>f</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>g</span>' '<span role='img' aria-label='emoji'>S</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>y</span>' '<span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>n</span>
        ''</>}</p>
    </div>
  );
}
