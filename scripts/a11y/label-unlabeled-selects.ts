import { Project, SyntaxKind, type JsxAttribute, type JsxOpeningElement } from 'ts-morph';
import { globby } from 'globby';

const GLOBS = ['app/components/**/*.{tsx,jsx}', 'app/mini-games/_shared/**/*.{tsx,jsx}'];
const fallback = 'Select';

const hasAttr = (o: JsxOpeningElement, name: string) =>
  o
    .getAttributes()
    .some(
      (a) =>
        a.getKind() === SyntaxKind.JsxAttribute &&
        (a as JsxAttribute).getNameNode()?.getText() === name,
    );

const getAttr = (o: JsxOpeningElement, name: string) => {
  const a = o
    .getAttributes()
    .find(
      (x) =>
        x.getKind() === SyntaxKind.JsxAttribute &&
        (x as JsxAttribute).getNameNode()?.getText() === name,
    ) as JsxAttribute | undefined;
  const ini = a?.getInitializer();
  return ini?.getText().replace(/^['"]|['"]$/g, '');
};

(async () => {
  const files = await globby(GLOBS, { gitignore: true });
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  files.forEach((f) => project.addSourceFileAtPathIfExists(f));

  let edits = 0;

  for (const sf of project.getSourceFiles()) {
    let changed = false;

    const selects = sf
      .getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
      .filter((o) => o.getTagNameNode().getText() === 'select');

    for (const open of selects) {
      if (hasAttr(open, 'aria-label') || hasAttr(open, 'aria-labelledby')) continue;

      const id = getAttr(open, 'id');
      if (id) {
        const hasLabel = sf
          .getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
          .some(
            (o) =>
              o.getTagNameNode().getText() === 'label' &&
              o
                .getAttributes()
                .some(
                  (a) =>
                    a.getKind() === SyntaxKind.JsxAttribute &&
                    (a as JsxAttribute).getNameNode()?.getText() === 'htmlFor' &&
                    getAttr(o, 'htmlFor') === id,
                ),
          );
        if (hasLabel) continue;
      }

      open.addAttribute({ name: 'aria-label', initializer: `"${fallback}"` });
      changed = true;
      edits++;
    }

    if (changed) await sf.save();
  }
  await project.save();

  console.log(`Added aria-label to ${edits} <select> elements.`);
})();
