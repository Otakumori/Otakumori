'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.links = void 0;
exports.Layout = Layout;
exports.default = App;
exports.ErrorBoundary = ErrorBoundary;
const react_1 = __importDefault(require('react'));
const react_router_dom_1 = require('react-router-dom');
require('./app.css');
const links = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];
exports.links = links;
function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <react_router_dom_1.Meta />
        <react_router_dom_1.Links />
      </head>
      <body>
        {children}
        <react_router_dom_1.ScrollRestoration />
        <react_router_dom_1.Scripts />
      </body>
    </html>
  );
}
function App() {
  return <react_router_dom_1.Outlet />;
}
function ErrorBoundary({ error }) {
  return (
    <div className="error-container">
      <h1>Error</h1>
      <p>{error.message}</p>
    </div>
  );
}
