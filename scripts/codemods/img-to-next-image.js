/**
 * Converts <img> to <Image> only when width+height are present (safe).
 * - Preserves alt, className, style, loading.
 * - Injects `import Image from "next/image"` if missing.
 * - Skips nodes without explicit width+height; prints a summary you can fix manually.
 */
const jsc = require('jscodeshift');

const skipped = [];

function hasWH(attrs) {
  let w = null,
    h = null;
  for (const a of attrs) {
    if (a.type !== 'JSXAttribute') continue;
    if (a.name.name === 'width') w = a.value;
    if (a.name.name === 'height') h = a.value;
    if (a.name.name === 'fill') return true; // already using fill
  }
  return !!(w && h);
}

function ensureImport(root) {
  const hasImport =
    root.find(jsc.ImportDeclaration, { source: { value: 'next/image' } }).size() > 0 ||
    root
      .find(jsc.VariableDeclaration, {
        declarations: [
          { init: { callee: { name: 'require' }, arguments: [{ value: 'next/image' }] } },
        ],
      })
      .size() > 0;

  if (!hasImport) {
    root
      .get()
      .node.program.body.unshift(
        jsc.importDeclaration(
          [jsc.importDefaultSpecifier(jsc.identifier('Image'))],
          jsc.literal('next/image'),
        ),
      );
  }
}

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const imgs = root.find(j.JSXElement, { openingElement: { name: { name: 'img' } } });
  if (!imgs.size()) return null;

  let changed = false;

  imgs.forEach((path) => {
    const el = path.node.openingElement;
    const attrs = el.attributes || [];

    // Only transform when safe
    const can = hasWH(attrs);
    if (!can) {
      skipped.push(file.path);
      return;
    }

    // Build new <Image ... />
    const newAttrs = attrs.map((a) => {
      if (
        a.type === 'JSXAttribute' &&
        a.name.name === 'src' &&
        a.value &&
        a.value.type === 'Literal'
      ) {
        // Keep literal
        return a;
      }
      return a;
    });

    const newOpening = j.jsxOpeningElement(j.jsxIdentifier('Image'), newAttrs, el.selfClosing);
    const newClosing = path.node.closingElement
      ? j.jsxClosingElement(j.jsxIdentifier('Image'))
      : null;

    path.replace(j.jsxElement(newOpening, newClosing, path.node.children));
    changed = true;
  });

  if (changed) ensureImport(root);

  const output = root.toSource({ quote: 'single', reuseWhitespace: false });
  return output;
};

module.exports.parser = 'tsx';

module.exports.postProcess = function () {
  if (skipped.length) {
    console.log(
      '\n[img-to-next-image] Skipped files (missing width/height or using layout that needs manual sizing):',
    );
    const uniq = [...new Set(skipped)];
    uniq.forEach((f) => console.log(' -', f));
    console.log(
      'TIP: Wrap the image in a sized container and switch to <Image fill /> manually for these.\n',
    );
  }
};
