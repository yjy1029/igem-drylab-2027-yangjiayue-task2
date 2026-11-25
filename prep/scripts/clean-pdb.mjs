import fs from 'node:fs';
import path from 'node:path';

// ---------- 1. 读文件 ----------
const here = import.meta.dirname;
const file = path.join(here, '..', 'raw', '1EMA.pdb');

const text = fs.readFileSync(file, 'latin1');
const lines = text.split('\n');

// ---------- 2. 过滤 ----------
const kept = [];
let nAtom = 0;
let nCro = 0;
let nMse = 0;
let nDrop = 0;

for (const line of lines) {
    const rec = line.substring(0, 6).trim();

    // 不是原子行（REMARK / CONECT / TER / END ...）→ 跳过
    if (rec !== 'ATOM' && rec !== 'HETATM') {
        continue;
    }

    // 只要链 A
    const chain = line.substring(21, 22);
    if (chain !== 'A') {
        nDrop++;
        continue;
    }

    if (rec === 'ATOM') {
        // 标准氨基酸原子：全要
        kept.push(line);
        nAtom++;
    } else {
        // HETATM：只有 CRO / MSE 要
        const resName = line.substring(17, 20).trim();
        if (resName === 'CRO') {
            kept.push(line);
            nCro++;
        } else if (resName === 'MSE') {
            kept.push(line);
            nMse++;
        } else {
            nDrop++;          // 主要是 HOH（水）
        }
    }
}

// ---------- 3. 报告 ----------
console.log('保留 ATOM =', nAtom);
console.log('保留 CRO  =', nCro);
console.log('保留 MSE  =', nMse);
console.log('丢弃      =', nDrop);
console.log('合计保留  =', kept.length);
const outDir = path.join(here, '..', 'clean');
const outFile = path.join(outDir, '1EMA.pdb');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, kept.join('\n') + '\n', 'latin1');

console.log('已写出:', outFile);
console.log('写出行数:', kept.length);