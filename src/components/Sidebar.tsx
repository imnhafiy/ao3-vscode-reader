import { useState } from 'react';
import { Chevron, FileIcon, FolderIcon } from './Icons';
import { tabLabel } from './EditorTabs';

type Props = {
  rootName: string;
  chapterTitles: string[];
  activeChapter: number;
  onSelectChapter: (i: number) => void;
};

type TreeNode = { name: string; children?: TreeNode[]; chapter?: number };

const f = (name: string): TreeNode => ({ name });
const d = (name: string, children: TreeNode[]): TreeNode => ({ name, children });

const fileColor = (name: string) =>
  name.endsWith('.ts') || name.endsWith('.tsx') ? 'var(--cyan)'
  : name.endsWith('.json') ? 'var(--yellow)'
  : name.endsWith('.js') ? 'var(--yellow)'
  : name.endsWith('.md') ? 'var(--purple)'
  : 'var(--muted)';

function buildTree(chapterTitles: string[]): TreeNode[] {
  return [
    d('src', [
      // real: clicking these switches chapters
      d('chapters', chapterTitles.map((t, i) => ({ name: `${tabLabel(t, i)}.ts`, chapter: i }))),
      d('components', [f('Angst.tsx'), f('Fluff.tsx'), f('SlowBurn.tsx')]),
      d('hooks', [f('useKudos.ts'), f('useComments.ts'), f('useBookmark.ts')]),
      d('utils', [f('slugify.ts'), f('plotHoles.ts')]),
      f('author-notes.md'),
    ]),
    d('node_modules', [
      d('.bin', [f('feelings')]),
      d('angst', [f('index.js'), f('package.json')]),
      d('fluff', [f('index.js'), f('package.json')]),
      d('slow-burn', [f('index.js'), f('package.json')]),
    ]),
    d('.git', [f('HEAD'), f('config'), f('COMMIT_EDITMSG')]),
    f('package.json'),
    f('tsconfig.json'),
    f('README.md'),
  ];
}

export default function Sidebar({ rootName, chapterTitles, activeChapter, onSelectChapter }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set(['src', 'src/chapters']));
  const tree = buildTree(chapterTitles);

  const toggle = (path: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });

  const render = (nodes: TreeNode[], parent: string, depth: number) =>
    nodes.map((n) => {
      const path = parent ? `${parent}/${n.name}` : n.name;
      const pad = { paddingLeft: 8 + depth * 12 };

      if (n.children) {
        const isOpen = open.has(path);
        return (
          <div key={path}>
            <button className="tree-row" style={pad} onClick={() => toggle(path)}>
              <Chevron open={isOpen} />
              <span className="tree-icon folder"><FolderIcon open={isOpen} /></span>
              <span className="tree-name">{n.name}</span>
            </button>
            {isOpen && render(n.children, path, depth + 1)}
          </div>
        );
      }

      const real = n.chapter !== undefined;
      return (
        <button
          key={path}
          className={`tree-row file ${real ? 'link' : ''} ${real && n.chapter === activeChapter ? 'selected' : ''}`}
          style={{ paddingLeft: 8 + depth * 12 + 16 }}
          onClick={() => real && onSelectChapter(n.chapter!)}
          tabIndex={real ? 0 : -1}
        >
          <span className="tree-icon"><FileIcon color={fileColor(n.name)} /></span>
          <span className="tree-name">{n.name}</span>
        </button>
      );
    });

  return (
    <aside className="sidebar" aria-label="Explorer">
      <div className="sb-title">EXPLORER</div>
      <div className="sb-section-head"><Chevron open /> <span>{rootName.toUpperCase()}</span></div>
      <div className="tree">{render(tree, '', 0)}</div>
      <div className="sb-section-head collapsed"><Chevron open={false} /> <span>OUTLINE</span></div>
      <div className="sb-section-head collapsed"><Chevron open={false} /> <span>TIMELINE</span></div>
    </aside>
  );
}