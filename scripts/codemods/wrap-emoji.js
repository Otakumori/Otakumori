/**
 * Wraps standalone emoji characters inside JSXText with:
 *   <span role="img" aria-label="emoji">😤</span>
 * Skips code blocks, attributes, and already-wrapped instances.
 */
const j = require('jscodeshift');

const EMOJI_REGEX =
  /[\u231A-\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD-\u25FE\u2614-\u2615\u2648-\u2653\u267B\u267F\u2693\u26A1\u26AA-\u26AB\u26BD-\u26BE\u26C4-\u26C5\u26CE\u26D4\u26EA\u26F2-\u26F3\u26F5\u26FA\u26FD\u2702\u2705\u2708-\u2709\u270A-\u270B\u2728\u2733-\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B50\u2B55\u1F004\u1F0CF\u1F170-\u1F171\u1F17E-\u1F17F\u1F18E\u1F191-\u1F19A\u1F1E6-\u1F1FF\u1F201-\u1F202\u1F21A\u1F22F\u1F232-\u1F23A\u1F250-\u1F251\u1F300-\u1F6D2\u1F6E0-\u1F6E5\u1F6F0-\u1F6F3\u1F910-\u1F9FF]/;

module.exports = function transformer(file, api) {
  const root = j(file.source);

  root.find(j.JSXText).forEach((p) => {
    const txt = p.node.value;
    if (!EMOJI_REGEX.test(txt)) return;

    const parts = txt.split(/(\s+)/); // keep whitespace untouched
    const children = parts
      .map((chunk, i) => {
        if (!EMOJI_REGEX.test(chunk)) {
          return j.literal(chunk);
        }
        // wrap each emoji char
        const nodes = [];
        for (const ch of chunk) {
          if (EMOJI_REGEX.test(ch)) {
            nodes.push(
              j.jsxElement(
                j.jsxOpeningElement(
                  j.jsxIdentifier('span'),
                  [
                    j.jsxAttribute(j.jsxIdentifier('role'), j.literal('img')),
                    j.jsxAttribute(j.jsxIdentifier('aria-label'), j.literal('emoji')),
                  ],
                  false,
                ),
                j.jsxClosingElement(j.jsxIdentifier('span')),
                [j.literal(ch)],
              ),
            );
          } else {
            nodes.push(j.literal(ch));
          }
        }
        return nodes;
      })
      .flat();

    // Replace JSXText with fragments containing nodes
    j(p).replaceWith(
      j.jsxExpressionContainer(
        children.length === 1 && typeof children[0].value === 'string'
          ? j.literal(children[0].value)
          : j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), children),
      ),
    );
  });

  return root.toSource({ quote: 'single' });
};

module.exports.parser = 'tsx';
