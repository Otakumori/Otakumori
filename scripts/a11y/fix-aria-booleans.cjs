module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let touched = false;
  const BOOL = new Set(["aria-hidden","aria-checked","aria-expanded","aria-selected","aria-pressed"]);

  root.find(j.JSXAttribute).forEach((p) => {
    const name = p.value.name && p.value.name.name;
    if (!BOOL.has(name)) return;
    const init = p.value.value;
    if (!init) return;

    // aria-foo="true"/"false"
    if (init.type === "Literal" && typeof init.value === "string") {
      const v = init.value.toLowerCase();
      if (v === "true" || v === "false") {
        p.value.value = j.jsxExpressionContainer(j.literal(v === "true"));
        touched = true;
      }
    }

    // aria-foo={"true"/"false"}
    if (init.type === "JSXExpressionContainer" &&
        init.expression.type === "Literal" &&
        typeof init.expression.value === "string") {
      const v = init.expression.value.toLowerCase();
      if (v === "true" || v === "false") {
        p.value.value = j.jsxExpressionContainer(j.literal(v === "true"));
        touched = true;
      }
    }
  });

  return touched ? root.toSource() : null;
};
