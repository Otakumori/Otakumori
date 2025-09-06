/**
 * Convert inline animationDelay/animationDuration to CSS utility classes.
 * - animationDelay: '2s' | 2  -> class 'delay-2s'
 * - animationDuration: '8s' | 8 -> class 'duration-8s'
 * Removes the corresponding inline style props from style={{ ... }}.
 *
 * USAGE:
 *   npx jscodeshift -t scripts/no-inline/upgrade-animation-classes.cjs app/components/SomeFile.tsx --parser=tsx
 */
const { Project, SyntaxKind } = require('ts-morph');
const globby = require('globby');
const path = require('path');
const fs = require('fs');

function readFiles(globs) {
  return globby.sync(globs, { gitignore: true });
}

function toIntSeconds(node) {
  // Accept string '2s'/'2', template `2s`, or numeric 2
  const kind = node.getKind();
  if (kind === SyntaxKind.NumericLiteral) {
    const n = Number(node.getText());
    if (Number.isFinite(n)) return Math.max(0, Math.min(60, Math.round(n))); // clamp
  }
  if (kind === SyntaxKind.StringLiteral || kind === SyntaxKind.NoSubstitutionTemplateLiteral) {
    const raw = node.getLiteralText().trim().toLowerCase();
    const m = raw.match(/^(\d+(?:\.\d+)?)s?$/);
    if (m) return Math.max(0, Math.min(60, Math.round(parseFloat(m[1]))));
  }
  return null; // unsupported (dynamic)
}

async function run() {
  const patterns = process.argv.slice(2);
  const files = readFiles(
    patterns.length ? patterns : ['app/**/*.{tsx,jsx}', 'components/**/*.{tsx,jsx}'],
  );

  const project = new Project({ skipAddingFilesFromTsConfig: true });
  files.forEach((f) => project.addSourceFileAtPathIfExists(f));

  let changedFiles = 0,
    updates = 0,
    skipped = 0;

  for (const sf of project.getSourceFiles()) {
    let fileChanged = false;

    const opens = sf.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
    for (const open of opens) {
      const attrs = open.getAttributes();
      const styleAttr = attrs.find(
        (a) => a.getKind?.() === SyntaxKind.JsxAttribute && a.getName?.() === 'style',
      );
      if (!styleAttr) continue;

      const init = styleAttr.getInitializer?.();
      if (!init || !init.asKind || !init.asKind(SyntaxKind.JsxExpressionContainer)) continue;
      const expr = init.asKind(SyntaxKind.JsxExpressionContainer).getExpression();
      const obj = expr.asKind && expr.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!obj) {
        skipped++;
        continue;
      }

      const props = obj.getProperties();
      if (!props.length) continue;

      // Track found class fragments
      let delayClass = null;
      let durationClass = null;

      for (const p of props) {
        const pa = p.asKind && p.asKind(SyntaxKind.PropertyAssignment);
        if (!pa) continue;
        const key = pa.getNameNode().getText().replace(/['"]/g, '');
        const val = pa.getInitializer();
        if (!val) continue;

        if (key === 'animationDelay') {
          const secs = toIntSeconds(val);
          if (secs !== null && secs <= 10) {
            delayClass = `delay-${secs}s`;
            p.remove(); // remove from style obj
            updates++;
          }
        } else if (key === 'animationDuration') {
          const secs = toIntSeconds(val);
          if (secs !== null && secs >= 1 && secs <= 12) {
            durationClass = `duration-${secs}s`;
            p.remove();
            updates++;
          }
        }
      }

      // If we removed any props, patch className
      if (delayClass || durationClass) {
        const classAttr = attrs.find(
          (a) => a.getKind?.() === SyntaxKind.JsxAttribute && a.getName?.() === 'className',
        );
        const toAdd = [delayClass, durationClass].filter(Boolean).join(' ');

        if (!classAttr) {
          open.addAttribute({ name: 'className', initializer: `"${toAdd}"` });
        } else {
          const init2 = classAttr.getInitializer();
          if (!init2) {
            classAttr.setInitializer(`"${toAdd}"`);
          } else if (
            init2.getKind() === SyntaxKind.StringLiteral ||
            init2.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral
          ) {
            const current = init2.getLiteralText();
            classAttr.setInitializer(`\`${current} ${toAdd}\``);
          } else {
            // Expression → append with template literal (avoids adding clsx dependency)
            classAttr.setInitializer(`\`\${${init2.getText()}} ${toAdd}\``);
          }
        }

        // Clean up empty style
        if (obj.getProperties().length === 0) styleAttr.remove();
        fileChanged = true;
      }
    }

    if (fileChanged) {
      await sf.save();
      changedFiles++;
    }
  }

  await project.save();
  console.log(
    `✔ Animation fix: changed ${changedFiles} files, applied ${updates} updates, skipped ${skipped} dynamic blocks.`,
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
