const { Project, SyntaxKind } = require("ts-morph");
const { globby } = require("globby");

(async () => {
  const files = await globby(["app/**/*.{ts,tsx,js,jsx}", "components/**/*.{ts,tsx,js,jsx}", "src/**/*.{ts,tsx,js,jsx}"], { gitignore:true });
  const project = new Project({ skipAddingFilesFromTsConfig:true });
  files.forEach(f => project.addSourceFileAtPathIfExists(f));

  let changed = 0;
  for (const sf of project.getSourceFiles()) {
    let dirty = false;

    // remove unused imports quickly (tsc will keep you honest)
    sf.getImportDeclarations().forEach(id => {
      id.getNamedImports().forEach(ni => {
        const name = ni.getNameNode().getText();
        if (id.getModuleSpecifierValue() === "react") return;
        if (sf.getDescendantsOfKind(SyntaxKind.Identifier).filter(x => x.getText() === name).length <= 1) {
          ni.remove(); dirty = true;
        }
      });
      if (id.getNamedImports().length === 0 && !id.getDefaultImport() && !id.getNamespaceImport()) {
        id.remove(); dirty = true;
      }
    });

    // underscore unused function params
    sf.getDescendantsOfKind(SyntaxKind.Parameter).forEach(p => {
      const id = p.getNameNode();
      if (!id || !id.getText) return;
      const name = id.getText();
      if (name.startsWith("_")) return;

      // naive usage check inside the function
      const fn = p.getFirstAncestor(a =>
        a.getKind() === SyntaxKind.FunctionDeclaration ||
        a.getKind() === SyntaxKind.FunctionExpression ||
        a.getKind() === SyntaxKind.ArrowFunction
      );
      if (!fn) return;

      const used = fn.getDescendantsOfKind(SyntaxKind.Identifier).some(i =>
        i.getText() === name && i !== id
      );

      if (!used) {
        id.replaceWithText("_" + name);
        dirty = true;
      }
    });

    if (dirty) { await sf.save(); changed++; }
  }

  await project.save();
  console.log(`Updated ${changed} files (underscored unused params & trimmed unused imports).`);
})();
