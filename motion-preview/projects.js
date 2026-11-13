const projects = [
  {
    id: 'cheolmuk', name: '철과 묵', type: '조선 스팀펑크 3인칭 액션', role: '전투 시스템 · 적 AI',
    cover: 'assets/cm_title.jpg', position: '72% center', poster: 'assets/s_hero.jpg', exhibit: 'assets/s_aim.jpg',
    video: 'assets/boss.mp4', crop: true, range: [4.8, 14.6],
    summary: '화승총과 조준 연출, 받아치기 판정, 적 AI를 구현했습니다.',
    caseTitle: '공격을 읽고 받아치는 순간', detail: 'stages/2',
    evidence: [{ image: 'assets/s_parry.jpg', video: 'assets/boss.mp4', crop: true, range: [6.8, 14.6], caption: '보스전 플레이 영상' }],
    steps: [
      ['공격 예고', '적이 공격을 예고하면 공격 지점에 줄어드는 동심원을 표시합니다.'],
      ['입력 판정', '판정 시점 앞뒤 0.1초 안에 Ctrl을 누르면 받아치기에 성공합니다.'],
      ['공격 취소', '적의 공격을 취소하고 경직시켜 강공격을 할 기회를 만듭니다.'],
    ],
  },
  {
    id: 'grimoire', name: '그림모어', type: '3D 사이드뷰 보스전 액션', role: '보스 시스템 · 팀 공용 코드',
    summary: '보스 AI와 공격 패턴, 패링, 히트스탑을 구현했습니다.',
    caseTitle: '링이 닫히는 순간과 패링 판정을 맞추기', detail: 'ts',
    steps: [
      ['현상', '공격 예고 링이 닫히는 순간과 실제 패링 판정이 어긋났습니다.'],
      ['원인', '링과 패링 판정이 각각 다른 방식으로 시간을 계산했습니다.'],
      ['해결', '애니메이션 클립의 시간을 기준으로 링과 판정을 함께 진행했습니다.'],
    ],
  },
  {
    id: 'smartcity', name: '스마트시티', type: 'VR 지하철 멀티플레이', role: '열차 운행 · 네트워크 동기화',
    cover: 'assets/vr_card.jpg', poster: 'assets/vr_intro.jpg', video: 'assets/vr_intro.mp4',
    summary: '지하철 운행과 NPC, VR 아바타, 기기 간 상태 동기화를 구현했습니다.',
    caseTitle: '늦게 들어와도 같은 열차 상태를 보기', detail: 'ts',
    evidence: [
      { image: 'assets/vr_doorA.jpg', video: 'assets/vr_doorA.mp4', caption: '첫 번째 클라이언트' },
      { image: 'assets/vr_doorB.jpg', video: 'assets/vr_doorB.mp4', caption: '두 번째 클라이언트' },
    ],
    steps: [
      ['현상', '늦게 접속한 사람에게만 열차 문이 닫혀 있고 전광판이 비어 있었습니다.'],
      ['원인', '문과 승객 수를 그 순간 접속해 있던 사람에게 일회성 메시지로 보냈습니다.'],
      ['해결', '현재 상태를 방 속성에 저장하고, 뒤늦게 접속해도 그 값을 읽어 화면을 맞췄습니다.'],
    ],
  },
  {
    id: 'nyankov', name: '냥코프', type: '3D 익스트랙션 슈팅', role: '인벤토리 · 제작 시스템',
    cover: 'assets/nk_inv.png', position: '50% 42%', poster: 'assets/nk_drag.jpg', video: 'assets/nk_drag.mp4',
    summary: '아이템 이동과 제작, 수리, 가방 무게를 연결하는 인벤토리를 설계했습니다.',
    caseTitle: '씬이 바뀌어도 인벤토리 유지하기', detail: 'ts',
    evidence: [{ image: 'assets/nk_drag.jpg', video: 'assets/nk_drag.mp4', caption: '인벤토리 조작 영상' }],
    steps: [
      ['현상', '씬을 이동하면 인벤토리가 비고 시작 아이템이 다시 지급됐습니다.'],
      ['원인', '아이템 데이터를 관리하는 모델이 씬을 나갈 때 함께 사라졌습니다.'],
      ['해결', '모델을 씬에서 분리해 한 번만 만들고, 다음 씬에서도 같은 데이터를 사용했습니다.'],
    ],
  },
  {
    id: 'palegarden', name: '페일가든', type: '2D 생존 액션 · 1인 개발', role: '기획 · 시스템 · UI · 빌드',
    cover: 'assets/pg_card.jpg',
    summary: '적이 몰려오는 생존 액션을 설계하고, 오브젝트 풀링과 성장 시스템을 구현했습니다.',
    caseTitle: '2D 공격의 방향 유지하기', detail: 'ts',
    evidence: [{ image: 'assets/pg_card.jpg', caption: '생존 액션 플레이 화면' }],
    steps: [
      ['현상', '공격을 조준 방향으로 돌리자 각도에 따라 스프라이트가 사라졌습니다.'],
      ['원인', '3D 회전으로 평면 이미지가 기울어 옆면이 보였습니다.'],
      ['해결', '방향 벡터에서 각도를 구하고, 화면에 수직인 z축으로만 회전시켰습니다.'],
    ],
  },
  {
    id: 'vkeyboard', name: '가상 키보드', type: '웹캠 기반 입력 도구', role: '손 추적 · 키 판정',
    cover: 'data/virtualKeyboard_image.jpg', video: 'data/virtualKeyboard_prototype.mp4',
    summary: '웹캠 영상에서 손가락과 종이 키보드의 위치를 읽어 키를 입력하는 팀 프로젝트입니다.',
    caseTitle: '웹캠으로 종이 위의 키 읽기', detail: 'overview',
    evidence: [{ image: 'data/virtualKeyboard_image.jpg', video: 'data/virtualKeyboard_prototype.mp4', caption: '웹캠 입력 시연' }],
    steps: [
      ['좌표 기준', '종이에 인쇄된 ArUco 마커로 카메라 화면 속 키보드의 기준 좌표를 잡습니다.'],
      ['손가락 추적', '웹캠 영상에서 검출한 손가락 위치를 키보드 좌표에 대응시킵니다.'],
      ['키 판정', '손가락이 놓인 키 영역을 판정해 웹 화면에 입력을 전달합니다.'],
    ],
  },
];
