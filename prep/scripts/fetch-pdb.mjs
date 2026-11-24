#!/usr/bin/env node
/**
 * 从 RCSB PDB 下载 Task 2 所需的三个结构文件。
 *
 * 用法:  npm run fetch      或   node prep/scripts/fetch-pdb.mjs
 * 输出:  prep/raw/<ID>.pdb  + 打印字节数与 SHA-256（写进 prep/notes.md 作为版本证据）
 *
 * 只依赖 Node 18+ 内置的 fetch / crypto / fs，不需要任何第三方包。
 */

import { mkdir, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const RAW = join(ROOT, 'prep', 'raw');

const IDS = ['1EMA', '1M17', '1BRS'];
const BASE = 'https://files.rcsb.org/download';

async function downloadOne(id) {
  const url = `${BASE}/${id}.pdb`;
  const out = join(RAW, `${id}.pdb`);
  process.stdout.write(`  ${id} … `);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'igem-drylab-2027-task2/0.1 (educational)' },
  });
  if (!res.ok) {
    throw new Error(`${id}: HTTP ${res.status} ${res.statusText} (${url})`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  // 粗略校验：PDB 文本应以 HEADER 或 记录名 开头，且不含 HTML
  const head = buf.subarray(0, 200).toString('latin1');
  if (/<html/i.test(head)) {
    throw new Error(`${id}: 服务器返回了 HTML 而不是 PDB，可能被重定向/拦截`);
  }

  await writeFile(out, buf);

  const sha = createHash('sha256').update(buf).digest('hex');
  const nAtom = buf.toString('latin1').split('\n').filter((l) => l.startsWith('ATOM')).length;
  const nHet = buf.toString('latin1').split('\n').filter((l) => l.startsWith('HETATM')).length;

  console.log('ok');
  console.log(`      path   ${out}`);
  console.log(`      bytes  ${buf.length.toLocaleString('en-US')}`);
  console.log(`      atoms  ATOM=${nAtom}  HETATM=${nHet}`);
  console.log(`      sha256 ${sha}`);
  return { id, bytes: buf.length, sha256: sha, atoms: nAtom, het: nHet };
}

async function main() {
  console.log('');
  console.log('=== 下载 RCSB PDB 结构文件 ===');
  await mkdir(RAW, { recursive: true });

  const results = [];
  for (const id of IDS) {
    try {
      results.push(await downloadOne(id));
    } catch (err) {
      console.error('failed');
      console.error(`      ${err.message}`);
      console.error(`      可手动下载: ${BASE}/${id}.pdb  →  放到 prep/raw/${id}.pdb`);
      process.exitCode = 1;
    }
  }

  if (results.length) {
    console.log('');
    console.log('--- 复制以下内容到 prep/notes.md ---');
    console.log(`下载日期: ${new Date().toISOString().slice(0, 10)}`);
    console.log('| PDB | bytes | ATOM | HETATM | sha256 |');
    console.log('|---|---|---|---|---|');
    for (const r of results) {
      console.log(`| ${r.id} | ${r.bytes} | ${r.atoms} | ${r.het} | ${r.sha256.slice(0, 16)}… |`);
    }
    console.log('');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
