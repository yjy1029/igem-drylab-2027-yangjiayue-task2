import fs from 'node:fs';
import path from 'node:path';

const here = import.meta.dirname;

// 配置表：三个结构只有这三处不同
const structures = [
    { id: '1EMA', chains: ['A'], het: ['CRO', 'MSE'] },
    { id: '1M17', chains: ['A'], het: ['AQ4'] },
    { id: '1BRS', chains: ['A', 'D'], het: [] },
];

for (const s of structures) {
    // ---------- 读 ----------
    const inFile = path.join(here, '..', 'raw', s.id + '.pdb');
    const text = fs.readFileSync(inFile, 'latin1');
    const lines = text.split('\n');

    // ---------- 筛（注意：这几个变量在循环内部，每个结构从零开始）----------
    const kept = [];
    let nAtom = 0;
    let nHet = 0;
    let nDrop = 0;

    for (const line of lines) {
        if (line.length < 22) continue;

        const rec = line.substring(0, 6).trim();
        if (rec !== 'ATOM' && rec !== 'HETATM') continue;

        const chain = line.substring(21, 22);
        if (!s.chains.includes(chain)) {
            nDrop++;
            continue;
        }

        if (rec === 'ATOM') {
            kept.push(line);
            nAtom++;
        } else {
            const resName = line.substring(17, 20).trim();
            if (s.het.includes(resName)) {
                kept.push(line);
                nHet++;
            } else {
                nDrop++;
            }
        }
    }

    // ---------- 写 ----------
    const outDir = path.join(here, '..', 'clean');
    const outFile = path.join(outDir, s.id + '.pdb');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, kept.join('\n') + '\n', 'latin1');

    // ---------- 报告 ----------
    console.log(s.id, ' ATOM=', nAtom, ' HETATM=', nHet, ' 合计=', kept.length, ' 丢弃=', nDrop);
}