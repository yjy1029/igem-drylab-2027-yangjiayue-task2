#!/usr/bin/env node
/**
 * 技术探针 A 生成器：spike/01-hello-3dmol.html
 *
 * 目的：验证「3Dmol.js + 内嵌结构数据 + 完全离线」这条最小链路能跑通。
 * 它故意 **不** 内联库文件（用相对路径引 node_modules 里的 3Dmol-min.js），
 * 这样你能清楚看到"库"和"数据"两件事分别是怎么进来的；
 * 真正的单文件内联是探针 C（S7）要验证的事。
 *
 * 用法：
 *   node spike/build-spike.mjs            # 用 1EMA（默认）
 *   node spike/build-spike.mjs 1M17       # 换一个结构
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const id = (process.argv[2] ?? '1EMA').toUpperCase();

const pdbPath = join(ROOT, 'prep', 'raw', `${id}.pdb`);
const outPath = join(HERE, '01-hello-3dmol.html');

const pdb = await readFile(pdbPath, 'latin1');
const nAtom = pdb.split('\n').filter((l) => l.startsWith('ATOM')).length;
const nHet = pdb.split('\n').filter((l) => l.startsWith('HETATM')).length;

// 关键：用 JSON.stringify 生成安全的 JS 字符串字面量，
// 避免换行/引号/反斜杠把模板字符串撑破（这是内联数据最经典的坑）。
const pdbLiteral = JSON.stringify(pdb);

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>探针 A · 3Dmol.js 离线渲染 ${id}</title>
<style>
  html, body { margin: 0; height: 100%; background: #0f1620; color: #e6edf3;
    font: 14px/1.5 system-ui, "Segoe UI", "Microsoft YaHei", sans-serif; }
  #stage { position: absolute; inset: 0; }
  #hud { position: absolute; left: 16px; top: 16px; padding: 12px 16px;
    background: rgba(20, 30, 42, .82); border: 1px solid #2a3a4e;
    border-radius: 10px; backdrop-filter: blur(6px); max-width: 320px; }
  #hud b { color: #58d3c0; font-weight: 600; }
  #hud code { font-family: Consolas, "Cascadia Mono", monospace; color: #9fb3c8; }
  #hud ul { margin: 8px 0 0; padding-left: 18px; color: #9fb3c8; }
  #err { position: absolute; left: 16px; bottom: 16px; right: 16px; color: #ff7b72;
    font-family: Consolas, monospace; white-space: pre-wrap; }
</style>
</head>
<body>
<div id="stage"></div>
<div id="hud">
  <div>探针 A：<b>${id}</b> · ATOM ${nAtom} / HETATM ${nHet}</div>
  <ul>
    <li>拖动旋转 · 滚轮缩放</li>
    <li>断网后仍能打开 → 通过</li>
    <li>F12 → Network 应为 0 请求</li>
    <li>Network 里唯一那条 <code>3Dmol-min.js</code> 是本地文件</li>
  </ul>
</div>
<div id="err"></div>

<!-- 库：本地文件，不走 CDN -->
<script src="../node_modules/3dmol/build/3Dmol-min.js"></script>
<script>
  window.addEventListener('error', function (e) {
    document.getElementById('err').textContent = 'ERROR: ' + (e.message || e);
  });

  try {
    if (typeof $3Dmol === 'undefined') {
      throw new Error('$3Dmol 未定义 —— 库没加载成功，检查 ../node_modules/3dmol/build/3Dmol-min.js 是否存在');
    }

    // 数据：直接内嵌为字符串常量，不 fetch、不 XHR
    var PDB = ${pdbLiteral};

    var viewer = $3Dmol.createViewer('stage', {
      backgroundColor: '#0f1620',
      antialias: true
    });

    var model = viewer.addModel(PDB, 'pdb');

    viewer.setStyle({}, {
      cartoon: { color: '#58d3c0', opacity: 1.0 }
    });

    // 把发色团 CRO 单独标出来 —— 顺便验证 HETATM 里的共价残基确实存在
    viewer.addStyle({ resn: 'CRO' }, { stick: { colorscheme: 'magentaCarbon', radius: 0.22 } });

    viewer.zoomTo();
    viewer.render();
  } catch (err) {
    document.getElementById('err').textContent = 'ERROR: ' + err.message;
  }
</script>
</body>
</html>
`;

await mkdir(HERE, { recursive: true });
await writeFile(outPath, html, 'utf8');
console.log(`written: ${outPath}`);
console.log(`  bytes : ${Buffer.byteLength(html).toLocaleString('en-US')}`);
console.log(`  data  : ${id}  ATOM=${nAtom}  HETATM=${nHet}`);
console.log('  下一步：断网 → 双击打开 → 能旋转即通过');
