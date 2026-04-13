import type { Locale } from "./locale";

export type Messages = {
  landing: {
    about: string;
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
    /** 오른쪽 열: 한글 미션 (항상 표시) */
    missionKo: string;
    /** 오른쪽 열: 영문 미션 (항상 표시) */
    missionEn: string;
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
    contactInfo: string;
    mapLink: string;
    phoneLabel: string;
    emailLabel: string;
    hoursLabel: string;
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
    directions: string;
    hours: string;
    phone: string;
    email: string;
    /** Google Maps 검색용 (한글 주소 권장) */
    mapQuery: string;
  };
};

const ko: Messages = {
  landing: {
    about: "About",
    contactUs: "Contact Us",
    heroLine1: "상상을,",
    heroLine2: "현실로.",
    heroSubKoAfterBrand:
      "은 유리 코어 기판 기술의 새로운 시대를 열어갈 것이다.",
    heroSubEnAfterBrand: "",
    ctaContact: "지금 문의하기",
  },
  about: {
    missionKo:
      "유리온은 유리 코어 기판 기술의 새로운 시대를 열어갈 것이다.",
    missionEn:
      "U:RION will usher in a new era of glass core substrate technology.",
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
    contactInfo: "연락처 정보",
    mapLink: "지도에서 보기",
    phoneLabel: "전화",
    emailLabel: "이메일",
    hoursLabel: "운영 시간",
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
    directions:
      "SRT·수도권 전철 동탄역 인근입니다. 방문 전 주차·동선은 전화로 문의해 주시면 안내드립니다.",
    hours: "평일 10:00 – 18:00 · 주말·공휴일 휴무",
    phone: "031-5180-0725",
    email: "daecheol.bang@uri-on.com",
    mapQuery:
      "경기도 화성시 동탄영천로 150 현대실리콘앨리동탄 B동 1135호",
  },
};

const en: Messages = {
  landing: {
    about: "About",
    contactUs: "Contact Us",
    heroLine1: "From vision",
    heroLine2: "to reality.",
    heroSubKoAfterBrand: "",
    heroSubEnAfterBrand:
      " will usher in a new era of glass core substrate technology.",
    ctaContact: "Get in touch",
  },
  about: {
    missionKo:
      "유리온은 유리 코어 기판 기술의 새로운 시대를 열어갈 것이다.",
    missionEn:
      "U:RION will usher in a new era of glass core substrate technology.",
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
    contactInfo: "Contact details",
    mapLink: "View on map",
    phoneLabel: "Phone",
    emailLabel: "Email",
    hoursLabel: "Hours",
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
    directions:
      "Near SRT / Seoul Metropolitan Subway Dongtan Station. Please call ahead for parking and building access.",
    hours: "Weekdays 10:00–18:00 · Closed weekends and public holidays",
    phone: "031-5180-0725",
    email: "daecheol.bang@uri-on.com",
    mapQuery:
      "경기도 화성시 동탄영천로 150 현대실리콘앨리동탄 B동 1135호",
  },
};

export function getDictionary(locale: Locale): Messages {
  return locale === "en" ? en : ko;
}
