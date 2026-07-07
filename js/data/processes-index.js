// 8대 공정 + HBM 레지스트리 — 모든 페이지의 내비게이션/색상/메타 단일 소스
export const PROCESSES = [
  {
    id: 'wafer', num: 1, title: '웨이퍼 제조', en: 'Wafer Fabrication',
    color: '#8ab4ff',
    desc: '초고순도 실리콘 잉곳을 성장시키고 얇게 절단·연마하여 거울면 웨이퍼를 만듭니다.',
    equip: 'CZ 단결정 성장로 · 와이어 소 · CMP 폴리셔',
  },
  {
    id: 'oxidation', num: 2, title: '산화 공정', en: 'Oxidation',
    color: '#6ee7b7',
    desc: '고온 산화로에서 웨이퍼 표면에 SiO₂ 절연막을 성장시켜 보호막과 게이트 절연막을 형성합니다.',
    equip: '수평/수직 산화로 · RTP 장비',
  },
  {
    id: 'photo', num: 3, title: '포토리소그래피', en: 'Photolithography',
    color: '#ffd166',
    desc: '감광액을 도포하고 EUV/ArF 노광기로 회로 패턴을 웨이퍼에 전사하는 핵심 공정입니다.',
    equip: 'ASML EUV/ArF 스캐너 · TEL 트랙(코터/디벨로퍼)',
  },
  {
    id: 'etch', num: 4, title: '식각 공정', en: 'Etching',
    color: '#f472b6',
    desc: '플라즈마로 불필요한 막을 선택적으로 제거하여 패턴을 실제 구조물로 새깁니다.',
    equip: 'Lam/TEL/AMAT 플라즈마 식각기(RIE·HARC)',
  },
  {
    id: 'deposition', num: 5, title: '증착·이온주입', en: 'Deposition & Implant',
    color: '#a78bfa',
    desc: 'CVD/ALD/PVD로 박막을 쌓고, 이온주입기로 불순물을 주입해 전기적 특성을 만듭니다.',
    equip: 'AMAT/원익IPS CVD · ASM ALD · 이온주입기',
  },
  {
    id: 'metal', num: 6, title: '금속 배선', en: 'Metallization',
    color: '#fb923c',
    desc: '수억 개의 소자를 전기적으로 연결하는 금속 배선을 형성하고 CMP로 평탄화합니다.',
    equip: '스퍼터(PVD) · 구리 도금기 · CMP 폴리셔',
  },
  {
    id: 'eds', num: 7, title: 'EDS 테스트', en: 'Electrical Die Sorting',
    color: '#22d3ee',
    desc: '프로브 카드로 웨이퍼 상태의 칩을 전수 검사해 양품/불량을 판정하고 리페어합니다.',
    equip: '프로버(TEL/SEMES) · 테스터(Advantest) · 프로브 카드',
  },
  {
    id: 'packaging', num: 8, title: '패키징', en: 'Packaging',
    color: '#f87171',
    desc: '웨이퍼를 칩 단위로 잘라 기판에 실장하고 밀봉하여 완제품 반도체로 만듭니다.',
    equip: 'Disco 다이서 · 다이본더 · 몰딩 프레스 · 리플로우',
  },
];

export const HBM = {
  id: 'hbm', title: 'HBM 특화 공정', en: 'High Bandwidth Memory',
  color: '#ff5a2a',
  desc: 'TSV로 DRAM을 수직 관통 연결하고 12~16단 적층 후 MR-MUF로 몰딩하는 SK하이닉스 핵심 기술.',
  equip: 'TSV 식각기 · Cu 도금기 · 한미반도체 TC본더 · MR-MUF 몰딩',
};

export function getProcess(id) {
  if (id === 'hbm') return HBM;
  return PROCESSES.find(p => p.id === id) || PROCESSES[0];
}

// 공통 topnav 렌더 (모든 페이지에서 호출)
export function renderNav(activeId) {
  const nav = document.querySelector('.topnav nav');
  if (!nav) return;
  const links = [
    { href: 'index.html', id: 'home', label: '홈' },
    ...PROCESSES.map(p => ({ href: `process.html?id=${p.id}`, id: p.id, label: `${p.num}. ${p.title}` })),
    { href: 'hbm.html', id: 'hbm', label: '★ HBM' },
    { href: 'spotfire.html', id: 'spotfire', label: '📊 Spotfire 분석실' },
    { href: 'equipment.html', id: 'equipment', label: '🔧 설비 분석실' },
  ];
  nav.innerHTML = links.map(l =>
    `<a href="${l.href}" class="${l.id === activeId ? 'active' : ''}">${l.label}</a>`
  ).join('');
}
