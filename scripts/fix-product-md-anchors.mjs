#!/usr/bin/env node
/**
 * 按 GitLab（Comrak / GLFM）标题锚点算法重写 Markdown 文档内链，并校验无悬空链接。
 *
 * 背景见 kit docs/LESSONS.md L-2026-07-15-01：GitLab 17+ 生成标题 ID 时**删除**标点
 * （`.`、`：`、`（）` 等），只把空格变 `-`；手拼或按 GitHub 习惯写的 `#3-0-2-…`
 * 在 GitLab 点不动。本脚本把文中所有 `](#...)` 换成真实锚点。
 *
 * 用法（在游戏仓根目录）：
 *   node scripts/fix-product-md-anchors.mjs                 # 修 docs/games/<*>/product.md
 *   node scripts/fix-product-md-anchors.mjs --check         # 只检查，不写文件（CI / 提交前）
 *   node scripts/fix-product-md-anchors.mjs docs/a.md b.md  # 指定文件
 */
import fs from 'node:fs';
import path from 'node:path';

/** Comrak 允许留在锚点里的字符：空格、连字符、字母、组合符、数字、连接标点 */
function isPermittedChar(c) {
  if (c === ' ' || c === '-') return true;
  return /\p{L}|\p{M}|\p{N}|\p{Pc}/u.test(c);
}

function anchorizeBase(header) {
  return [...header.toLowerCase()]
    .filter(isPermittedChar)
    .map((c) => (c === ' ' ? '-' : c))
    .join('');
}

/** 同名标题按出现顺序加 -1、-2… */
class Anchorizer {
  constructor() {
    this.used = new Set();
  }

  anchorize(header) {
    const base = anchorizeBase(header);
    let uniq = 0;
    for (;;) {
      const id = uniq === 0 ? base : `${base}-${uniq}`;
      if (!this.used.has(id)) {
        this.used.add(id);
        return id;
      }
      uniq += 1;
    }
  }
}

/** 常见错误写法：把标点也变成了连字符（GitHub 风格 / 手拼） */
function wrongSlug(text) {
  let s = text.toLowerCase();
  s = s.replace(/[^\p{L}\p{N}\-_]+/gu, ' ');
  s = s.trim().replace(/\s+/g, '-');
  return s.replace(/-+/g, '-');
}

function processFile(filePath, { check }) {
  const original = fs.readFileSync(filePath, 'utf8');
  let md = original;

  const anchorizer = new Anchorizer();
  const wrongUsed = new Map();
  const validAnchors = new Set();
  const replaceMap = {};

  const headingRe = /^(#{1,6})\s+(.+?)(?:\s+\{#([^}]+)\})?\s*$/gm;
  let m;
  while ((m = headingRe.exec(md)) !== null) {
    const title = m[2].trim();
    const custom = m[3];
    const slug = anchorizer.anchorize(title);
    validAnchors.add(slug);

    // `{#custom-id}` 不是 GitLab 原生写法，映射到真实锚点后删除
    if (custom) replaceMap[custom] = slug;

    let wrong = wrongSlug(title);
    const seen = wrongUsed.get(wrong) || 0;
    wrongUsed.set(wrong, seen + 1);
    if (seen > 0) wrong += `-${seen}`;
    replaceMap[wrong] = slug;
  }

  md = md.replace(/^(#{1,6}\s+.+?)\s+\{#[^}]+\}\s*$/gm, '$1');

  // 长键优先，避免短锚点是长锚点前缀时误替换
  const keys = Object.keys(replaceMap).sort((a, b) => b.length - a.length);
  for (const old of keys) {
    md = md.split(`](#${old})`).join(`](#${replaceMap[old]})`);
  }

  const linked = [...new Set([...md.matchAll(/\]\(#([^)]+)\)/g)].map((x) => x[1]))];
  const unresolved = linked.filter((a) => !validAnchors.has(a));
  const changed = md !== original;
  const name = path.relative(process.cwd(), filePath) || filePath;

  if (unresolved.length) {
    console.error(`✗ ${name}: 无法解析的内链锚点（文中无对应标题）：`);
    for (const a of unresolved) console.error(`    #${a}`);
    return { ok: false, changed };
  }

  if (check) {
    if (changed) {
      console.error(`✗ ${name}: 内链锚点与标题不一致，运行不带 --check 的命令修复`);
      return { ok: false, changed };
    }
    console.log(`✓ ${name}: ${linked.length} 个内链，锚点全部正确`);
    return { ok: true, changed };
  }

  if (changed) {
    fs.writeFileSync(filePath, md);
    console.log(`✓ ${name}: 已重写内链（${linked.length} 个链接 / ${validAnchors.size} 个标题）`);
  } else {
    console.log(`✓ ${name}: 无需修改（${linked.length} 个内链）`);
  }
  return { ok: true, changed };
}

function defaultTargets() {
  const base = path.join('docs', 'games');
  if (!fs.existsSync(base)) return [];
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(base, d.name, 'product.md'))
    .filter((p) => fs.existsSync(p));
}

const args = process.argv.slice(2);
const check = args.includes('--check');
const targets = args.filter((a) => !a.startsWith('--'));
const files = targets.length > 0 ? targets : defaultTargets();

if (files.length === 0) {
  console.error('未找到 docs/games/<gameId>/product.md；请在游戏仓根目录运行，或显式传入文件路径。');
  process.exit(1);
}

let failed = false;
for (const f of files) {
  if (!fs.existsSync(f)) {
    console.error(`✗ ${f}: 文件不存在`);
    failed = true;
    continue;
  }
  if (!processFile(f, { check }).ok) failed = true;
}

process.exit(failed ? 1 : 0);
