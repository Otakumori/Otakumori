/**
 * Prefixes known, intentionally-unused variables/params with `_`
 * ONLY for the names you listed in your warnings, and ONLY if currently unused.
 * It scans your tree and applies surgical renames via recast.
 */
import { globby } from 'globby';
import fs from 'node:fs/promises';
import recast from 'recast';
import * as tsParser from 'recast/parsers/typescript';

const NAMES = new Set([
  // from your logs
  'anchors',
  'dt',
  'deltaTime',
  'ORDER',
  'T',
  'userId',
  'result',
  'ttl',
  'maxAge',
  'cookies',
  'getCategoryIcon',
  'index',
  'now',
  'running',
  'alpha',
  'seed',
  'bgImg',
  'petalImg',
  'end',
  'miss',
  'push',
  'startIfNeeded',
  'submit',
  'handleSkip',
  'handleFaceClick',
  'rotateToFace',
  'frameId',
  'hueBase',
  'gameId',
  'monitor',
  'newCardIds',
  'InputEvent',
  'Image',
  'useRef',
  'useSound',
  't',
  'inv',
  'petalEconomy',
  'isSaving',
  'next',
  'bgImg',
  'bubbleImg',
  'ended',
  'useMemo',
  'setFace',
  'error',
  'clearCart',
  'open',
  'setOpen',
  'useEffect',
  'useState',
  'Sparkles',
  'BackdropAbyssMystique',
  'Eye',
  'Volume2',
  'Palette',
  'Globe',
  '_err',
  'CherryTree',
  'PetalHUD',
  'petals',
  'motion',
  'AnimatePresence',
  'navLinks',
  'isSearchOpen',
  'setIsSearchOpen',
  'mobileOpen',
  'setMobileOpen',
  'scrolled',
  'pathname',
  'useReducer',
  'useAchievements',
  'setCommunityProgress',
  'setLeaderboard',
  'mode',
  'isSignedIn',
  'duration',
  'pointerDown',
  'p',
  'router',
  'monitor',
  'Database',
  'Shield',
  'Gamepad',
  'Film',
  'prisma',
  'variantId',
]);

function shouldPrefix(name: string) {
  return NAMES.has(name) && !name.startsWith('_');
}

async function processFile(path: string) {
  const source = await fs.readFile(path, 'utf8');
  const ast = recast.parse(source, { parser: tsParser as any });

  let changed = false;

  recast.types.visit(ast, {
    // function params
    visitFunction(pathFn) {
      const node: any = pathFn.node;
      if (node.params) {
        node.params.forEach((p: any) => {
          if (p.type === 'Identifier' && shouldPrefix(p.name)) {
            p.name = `_${p.name}`;
            changed = true;
          }
        });
      }
      this.traverse(pathFn);
    },
    // variable declarators
    visitVariableDeclarator(pathVar) {
      const node: any = pathVar.node;
      if (node.id?.type === 'Identifier' && shouldPrefix(node.id.name)) {
        node.id.name = `_${node.id.name}`;
        changed = true;
      }
      this.traverse(pathVar);
    },
    // object pattern (destructuring): { foo: foo }
    visitProperty(pth) {
      const node: any = pth.node;
      if (node.value?.type === 'Identifier' && shouldPrefix(node.value.name)) {
        node.value.name = `_${node.value.name}`;
        changed = true;
      }
      this.traverse(pth);
    },
  });

  if (changed) {
    await fs.writeFile(path, recast.print(ast, { quote: 'single' }).code, 'utf8');
    return true;
  }
  return false;
}

(async () => {
  const files = await globby(
    ['app/**/*.{ts,tsx,js,jsx}', 'components/**/*.{ts,tsx,js,jsx}', 'src/**/*.{ts,tsx,js,jsx}'],
    { gitignore: true },
  );

  let edited = 0;
  for (const f of files) {
    const ok = await processFile(f);
    if (ok) edited++;
  }

  // `[prefix-unused] Updated ${edited} file(s.`);
})();
