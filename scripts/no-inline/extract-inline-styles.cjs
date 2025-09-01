/* Extract static inline styles into colocated CSS Modules.
 * Usage:
 *   node scripts/no-inline/extract-inline-styles.cjs "app/**/*.{tsx,jsx}" "components/**/*.{tsx,jsx}"
 *
 * Notes:
 * - Only moves STATIC values (string or number literals).
 * - Numbers get "px" except unitless props (lineHeight, opacity, zIndex, fontWeight, flex, flexGrow, flexShrink, zoom).
 * - If className exists, it merges via clsx; otherwise it adds className.
 */
const { Project, SyntaxKind } = require("ts-morph");
const globby = require("globby");
const path = require("path");
const fs = require("fs");

const UNIT_LESS = new Set([
  "lineHeight", "opacity", "zIndex", "fontWeight", "flex", "flexGrow", "flexShrink", "zoom",
]);

const toKebab = (js) => js.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

async function run() {
  const patterns = process.argv.slice(2);
  const files = await globby(patterns.length ? patterns : ["app/**/*.{tsx,jsx}", "components/**/*.{tsx,jsx}"], { gitignore: true });

  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    manipulationSettings: { indentationText: 2 },
  });

  files.forEach((f) => project.addSourceFileAtPathIfExists(f));

  let touchedFiles = 0;
  let transformedBlocks = 0;
  let dynamicLeft = 0;

  for (const sf of project.getSourceFiles()) {
    const filepath = sf.getFilePath();
    const dir = path.dirname(filepath);
    const base = path.basename(filepath, path.extname(filepath));
    const cssPath = path.join(dir, `${base}.generated.module.css`);
    const relCssImport = `./${path.basename(cssPath)}`;
    let cssContent = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : "";

    // ensure CSS module import
    const hasCssImport = sf.getImportDeclarations().some((d) => d.getModuleSpecifierValue() === relCssImport);
    if (!hasCssImport) {
      sf.insertImportDeclaration(0, { defaultImport: "genStyles", moduleSpecifier: relCssImport });
    }

    const ensureClsx = () => {
      const has = sf.getImportDeclarations().some((d) => d.getModuleSpecifierValue() === "clsx");
      if (!has) sf.insertImportDeclaration(0, { defaultImport: "cn", moduleSpecifier: "clsx" });
    };

    const opens = sf.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
    let classIndex = 1;
    let fileChanged = false;

    for (const open of opens) {
      const attrs = open.getAttributes();
      const styleAttr = attrs.find((a) => a.getKind?.() === SyntaxKind.JsxAttribute && a.getName?.() === "style");
      if (!styleAttr) continue;

      const init = styleAttr.getInitializer?.();
      if (!init || !init.asKind || !init.asKind(SyntaxKind.JsxExpressionContainer)) continue;
      const expr = init.asKind(SyntaxKind.JsxExpressionContainer).getExpression();
      const obj = expr.asKind && expr.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!obj) { dynamicLeft++; continue; }

      const props = obj.getProperties();
      if (!props.length) { styleAttr.remove(); fileChanged = true; continue; }

      const entries = [];
      for (const p of props) {
        const pa = p.asKind && p.asKind(SyntaxKind.PropertyAssignment);
        if (!pa) continue;
        const key = pa.getNameNode().getText().replace(/['"]/g, "");
        const valueNode = pa.getInitializer();
        if (!valueNode) continue;

        if (valueNode.getKind() === SyntaxKind.StringLiteral || valueNode.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
          const lit = valueNode.getLiteralText();
          entries.push({ prop: toKebab(key), value: lit });
        } else if (valueNode.getKind() === SyntaxKind.NumericLiteral) {
          const num = Number(valueNode.getText());
          const cssVal = UNIT_LESS.has(key) ? String(num) : `${num}px`;
          entries.push({ prop: toKebab(key), value: cssVal });
        }
      }

      if (!entries.length) { dynamicLeft++; continue; }

      const className = `a11y_s${classIndex++}`;
      const rule = `.${className}{${entries.map((e) => `${e.prop}:${e.value}`).join(";")}}`;
      cssContent += (cssContent.endsWith("\n") || cssContent === "" ? "" : "\n") + rule + "\n";

      // className merge/add
      const classAttr = attrs.find((a) => a.getKind?.() === SyntaxKind.JsxAttribute && a.getName?.() === "className");
      if (!classAttr) {
        open.addAttribute({ name: "className", initializer: `{genStyles.${className}}` });
      } else {
        const init2 = classAttr.getInitializer();
        if (!init2) {
          classAttr.setInitializer(`{genStyles.${className}}`);
        } else if (init2.getKind() === SyntaxKind.StringLiteral || init2.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
          const current = init2.getLiteralText();
          classAttr.setInitializer(`\`${current} \${genStyles.${className}}\``);
        } else {
          ensureClsx();
          classAttr.setInitializer(`{cn(${init2.getText()}, genStyles.${className})}`);
        }
      }

      // remove static entries from style object
      for (const p of [...props]) {
        const pa = p.asKind && p.asKind(SyntaxKind.PropertyAssignment);
        if (!pa) continue;
        const v = pa.getInitializer();
        if (!v) continue;
        const isStatic =
          v.getKind() === SyntaxKind.StringLiteral ||
          v.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral ||
          v.getKind() === SyntaxKind.NumericLiteral;
        if (isStatic) p.remove();
      }

      if (obj.getProperties().length === 0) styleAttr.remove();

      fileChanged = true;
      transformedBlocks++;
    }

    if (fileChanged) {
      fs.writeFileSync(cssPath, cssContent, "utf8");
      await sf.save();
      touchedFiles++;
    }
  }

  await project.save();
  console.log(`✔ Updated ${touchedFiles} files, moved ${transformedBlocks} inline style blocks.`);
  if (dynamicLeft) console.log(`ℹ Skipped ${dynamicLeft} dynamic style blocks (non-literal values).`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
