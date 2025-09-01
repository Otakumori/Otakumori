const fs = require("fs");
const path = require("path");

function readLabelMap(p) {
  if (!p) return {};
  const abs = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  try { return JSON.parse(fs.readFileSync(abs, "utf8")); } catch { return {}; }
}

module.exports = function transformer(file, api, opts) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const map = readLabelMap(opts.labelMap);
  let touched = false;

  const hasText = (el) =>
    el.children?.some((ch) =>
      (ch.type === "JSXText" && ch.value.trim() !== "") ||
      (ch.type === "JSXExpressionContainer" && ch.expression.type === "StringLiteral")
    );

  const hasAttr = (attrs, name) =>
    (attrs || []).some((a) => a.type === "JSXAttribute" && a.name?.name === name);

  const inferName = () => map[path.basename(file.path, path.extname(file.path))];

  root.find(j.JSXElement, { openingElement: { name: { type: "JSXIdentifier", name: "a" } } })
    .forEach((p) => {
      const open = p.value.openingElement;
      const attrs = open.attributes || [];
      if (!hasAttr(attrs, "href")) return;
      if (hasAttr(attrs, "aria-label") || hasAttr(attrs, "aria-labelledby") || hasAttr(attrs, "title")) return;
      if (hasText(p.value)) return;
      open.attributes = attrs.concat([
        j.jsxAttribute(j.jsxIdentifier("aria-label"), j.stringLiteral(inferName() || "Link")),
      ]);
      touched = true;
    });

  return touched ? root.toSource() : null;
};
