import type { Locale } from "./locale";

export type Messages = {
  landing: {
    about: string;
    /** 모바일 햄버거 버튼 (aria-label) */
    openMenuAria: string;
    /** 모바일 메뉴 시트 제목 (스크린 리더용) */
    menuSheetTitle: string;
    /** 좌측 로고: 첫 슬라이드(히어로)로 이동 (aria-label) */
    logoHomeAria: string;
    contactUs: string;
    heroLine1: string;
    heroLine2: string;
    /** 한글 서브: 볼드 「유리온」 뒤에 붙는 문장 */
    heroSubKoAfterBrand: string;
    /** 영문 서브: 볼드 U:RION 뒤에 붙는 문장 (앞에 공백 포함) */
    heroSubEnAfterBrand: string;
    ctaContact: string;
  };
  about: {
    /** CEO 소개 — 한글 문단 (줄바꿈은 배열 요소로 구분) */
    missionKoParagraphs: string[];
    ceoAlt: string;
    close: string;
    closeAria: string;
  };
  contact: {
    title: string;
    subtitle: string;
    closeAria: string;
    successTitle: string;
    successSub: string;
    close: string;
    directions: string;
    mapLink: string;
    name: string;
    email: string;
    message: string;
    placeholderName: string;
    placeholderEmail: string;
    placeholderMessage: string;
    submit: string;
    submitting: string;
    err503: string;
    errGeneric: string;
    errNetwork: string;
  };
  lang: {
    switchKo: string;
    switchEn: string;
    switchAria: string;
  };
  contactSite: {
    address: string;
    /** Google Maps 검색용 (한글 주소 권장) */
    mapQuery: string;
  };
  /** 랜딩 2번째 풀페이지: TPF 정밀 제조 (1920×1080 기준 3열) */
  tpf: {
    ariaLabel: string;
    title: string;
    /** 가운데 열: 제목 */
    overviewTitle: string;
    /** 가운데 열: pin.gif 위 불릿 본문 */
    overviewBullets: string[];
    /** 왼쪽 열: 제목 */
    advantagesTitle: string;
    /** 왼쪽 열: 흰색 disc 메인 + 번호 하위(개요와 동일 disc, 하위는 회색) */
    advantagesItems: { heading: string; subpoints: string[] }[];
    resinTitle: string;
    /** 오른쪽 열: 수지 본문 불릿 (도식 상단 한 덩어리) */
    resinBullets: string[];
    pinTitle: string;
    pinProcessBullets: string[];
    tech01Alt: string;
    pinGifAlt: string;
  };
};

const ko: Messages = {
  landing: {
    about: "CEO",
    openMenuAria: "메뉴 열기",
    menuSheetTitle: "메뉴",
    logoHomeAria: "첫 화면으로 이동",
    contactUs: "CONTACT US",
    heroLine1: "상상을,",
    heroLine2: "현실로.",
    heroSubKoAfterBrand:
      "은 유리 코어 기판 기술의 새로운 시대를 열어갈 것이다.",
    heroSubEnAfterBrand: "",
    ctaContact: "지금 문의하기",
  },
  about: {
    missionKoParagraphs: [
      "(주)유리온의 이성재 대표이사는 한국화학연구원, 삼성전기,\n와이엠티를 거쳤으며 40여 년 이상 반도체 패키징 분야에서 연구 및 개발을 해왔습니다.",
      "유리 기판 TGV의 혁신적인 기술을 개발했으며, 반도체 패키징의 미래 발전을 위한 선봉장이 될 것입니다.",
    ],
    ceoAlt: "유리온 대표",
    close: "닫기",
    closeAria: "닫기",
  },
  contact: {
    title: "Contact Us",
    subtitle: "아래 양식을 작성해 주시면 빠르게 연락드리겠습니다.",
    closeAria: "닫기",
    successTitle: "문의가 접수되었습니다",
    successSub: "확인 후 입력하신 이메일로 연락드리겠습니다.",
    close: "닫기",
    directions: "오시는 길",
    mapLink: "지도에서 보기",
    name: "이름",
    email: "이메일",
    message: "메시지",
    placeholderName: "홍길동",
    placeholderEmail: "you@example.com",
    placeholderMessage: "프로젝트나 문의 내용을 적어 주세요.",
    submit: "보내기",
    submitting: "보내는 중…",
    err503:
      "서버에서 문의를 받을 준비가 되어 있지 않습니다. 잠시 후 다시 시도해 주세요.",
    errGeneric: "전송에 실패했습니다. 다시 시도해 주세요.",
    errNetwork: "네트워크 오류가 발생했습니다. 연결을 확인해 주세요.",
  },
  lang: {
    switchKo: "한국어",
    switchEn: "English",
    switchAria: "언어 선택",
  },
  contactSite: {
    address:
      "경기도 화성시 동탄영천로 150 현대실리콘앨리동탄 B동 1135호",
    mapQuery:
      "경기도 화성시 동탄영천로 150 현대실리콘앨리동탄 B동 1135호",
  },
  tpf: {
    ariaLabel: "TPF 정밀 제조 프로세스",
    title:
      "유리 기판 관통 전극(Through Glass Via)의 혁신적인 기술로 유리 기판의 새로운 시대를 열어갑니다.",
    overviewTitle: "TPF(TGV Pin Fill) 기술의 개요",
    overviewBullets: [
      "기존의 TGV(Through Glass Via)공정은 내부를 구리로 채우는 방법에 있어 전기도금 방식으로 진행",
      "TPF(TGV Pin Fill)는 도금방식 대신 유리 기판에 금속 핀을 직접 삽입하는 방식",
    ],
    advantagesTitle: "TPF 기술의 장점",
    advantagesItems: [
      {
        heading: "스퍼터 공정이 필요 없습니다.",
        subpoints: [
          "금속화 공정(Metallization)에 필수적인 고가의 스퍼터 장비 불필요",
          "스퍼터 불균일에 따른 도금 불량 문제 배제",
        ],
      },
      {
        heading: "높은 종횡비도 가능합니다.",
        subpoints: [
          "도금 방식의 경우 기판 두께 대비 비아홀 직경에 한계가 있음",
          "핀 삽입 방식은 비아홀 구리 채움 시 종횡비 제한이 없음",
          "따라서, Via Hole의 직경 및 두께 제한 없음",
        ],
      },
      {
        heading:
          "TGV 도금 방식과 비교해서 높은 공정 수율과 양산성 확보가 가능합니다.",
        subpoints: [
          "도금 불균일 및 Void 발생 문제 없음",
          "홀 막힘 문제가 발생하지 않음",
          "유리와 금속의 접착력 문제가 발생하지 않음",
        ],
      },
      {
        heading:
          "동일 기판 내에 다양한 비아 홀의 크기에 대해 동시 공정 진행이 가능합니다.",
        subpoints: [],
      },
      {
        heading:
          "TGV 도금 방식과 비교해서 높은 공정 수율과 양산성 확보가 가능합니다.",
        subpoints: [
          "도금 대비 높은 수율 및 양산성 가능",
          "도금 대비 낮은 공정비용",
        ],
      },
    ],
    resinTitle: "수지 (Resin)",
    resinBullets: [
      "TPF 공정에 적용되는 수지(Resin)는 전체 유리기판 보호, 비아홀 내부 충격완화, 마이크로 크랙의 방지 및 발생된 마이크로 크랙의 확산 방지 목적",
    ],
    pinTitle: "다중 비아홀 동시 핀 삽입 공정",
    pinProcessBullets: [
      "유리 기판 내 다중 홀에 대해 금속핀을 동시에 삽입 진행",
      "양산성 확보를 위해 패키지 기판 크기 또는 Strip단위로 진행",
    ],
    tech01Alt: "Glass·TGV·수지층·메탈 핀 단면 구조 도식",
    pinGifAlt: "TPF 핀 어레이 3D 개요",
  },
};

const en: Messages = {
  landing: {
    about: "CEO",
    openMenuAria: "Open menu",
    menuSheetTitle: "Menu",
    logoHomeAria: "Go to first screen",
    contactUs: "CONTACT US",
    heroLine1: "From vision",
    heroLine2: "to reality.",
    heroSubKoAfterBrand: "",
    heroSubEnAfterBrand:
      " will usher in a new era of glass core substrate technology.",
    ctaContact: "Get in touch",
  },
  about: {
    missionKoParagraphs: [
      "(주)유리온의 이성재 대표이사는 한국화학연구원, 삼성전기,\n와이엠티를 거쳤으며 40여 년 이상 반도체 패키징 분야에서 연구 및 개발을 해왔습니다.",
      "유리 기판 TGV의 혁신적인 기술을 개발했으며, 반도체 패키징의 미래 발전을 위한 선봉장이 될 것입니다.",
    ],
    ceoAlt: "U:RION leadership",
    close: "Close",
    closeAria: "Close",
  },
  contact: {
    title: "Contact Us",
    subtitle: "Fill out the form below and we’ll get back to you shortly.",
    closeAria: "Close",
    successTitle: "Your message has been received",
    successSub: "We’ll reach out to the email you provided.",
    close: "Close",
    directions: "Directions",
    mapLink: "View on map",
    name: "Name",
    email: "Email",
    message: "Message",
    placeholderName: "Jane Doe",
    placeholderEmail: "you@example.com",
    placeholderMessage: "Tell us about your project or inquiry.",
    submit: "Send",
    submitting: "Sending…",
    err503:
      "We’re not ready to receive inquiries yet. Please try again shortly.",
    errGeneric: "Something went wrong. Please try again.",
    errNetwork: "Network error. Check your connection and try again.",
  },
  lang: {
    switchKo: "한국어",
    switchEn: "English",
    switchAria: "Choose language",
  },
  contactSite: {
    address:
      "1135, Building B, Hyundai Silicon Alley Dongtan, 150 Dongtan Yeongcheon-ro, Hwaseong-si, Gyeonggi-do, Republic of Korea",
    mapQuery:
      "경기도 화성시 동탄영천로 150 현대실리콘앨리동탄 B동 1135호",
  },
  tpf: {
    ariaLabel: "TPF precision manufacturing process",
    title: "Precision Manufacturing Process",
    overviewTitle: "TPF (TGV Pin Fill) technology overview",
    overviewBullets: [
      "Conventional TGV (Through Glass Via) processes fill vias with copper using electroplating.",
      "TPF (TGV Pin Fill) inserts metal pins directly into the glass substrate instead of using plating.",
    ],
    advantagesTitle: "Benefits of TPF",
    advantagesItems: [
      {
        heading: "No sputter process is required.",
        subpoints: [
          "No expensive sputter tools required for the metallization sequence",
          "Avoids plating defects driven by sputter non-uniformity",
        ],
      },
      {
        heading: "High aspect ratios are achievable.",
        subpoints: [
          "Plating limits how small a via diameter can be versus substrate thickness",
          "Pin insertion has no aspect-ratio limit when filling vias with copper",
          "Therefore there is no fixed restriction on via diameter and thickness",
        ],
      },
      {
        heading:
          "Compared with TGV plating, higher process yield and mass-production scalability are achievable.",
        subpoints: [
          "No non-uniform plating or void formation",
          "No blocked-hole issues",
          "No glass–metal adhesion failures",
        ],
      },
      {
        heading:
          "Simultaneous processing for different via sizes on the same panel.",
        subpoints: [],
      },
      {
        heading:
          "Compared with TGV plating, higher process yield and mass-production scalability are achievable.",
        subpoints: [
          "Higher yield and mass-production potential versus plating",
          "Lower process cost than plating",
        ],
      },
    ],
    resinTitle: "Resin",
    resinBullets: [
      "In the TPF process, resin protects the full glass panel, cushions the inside of vias, prevents micro-cracks, and stops any micro-cracks that do form from spreading.",
    ],
    pinTitle: "Simultaneous pin insertion for multiple vias",
    pinProcessBullets: [
      "Metal pins are inserted simultaneously into multiple holes across the glass substrate.",
      "Processing proceeds by package panel size or strip unit to secure mass-production throughput.",
    ],
    tech01Alt: "Cross-section: glass, TGV, resin layers, and metal pin",
    pinGifAlt: "3D overview of the TPF pin array",
  },
};

export function getDictionary(locale: Locale): Messages {
  return locale === "en" ? en : ko;
}
