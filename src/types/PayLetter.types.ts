export enum PaymentCode {
  CREDIT_CARD = "creditcard", // 신용카드
  BANK_TRANSFER = "banktransfer", // 인터넷뱅킹(금융결제원)
  VIRTUAL_ACCOUNT = "virtualaccount", // 가상계좌
  MOBILE = "mobile", // 휴대폰
  VOUCHER = "voucher", // 문화상품권
  BOOK = "book", // 도서문화상품권
  CULTURE = "culture", // 컬쳐랜드상품권
  SMART_CULTURE = "smartculture", // 스마트문상
  HAPPY_MONEY = "happymoney", // 해피머니상품권
  MOBILE_POP = "mobilepop", // 모바일팝
  TEEN_CASH = "teencash", // 틴캐시
  T_MONEY = "tmoney", // 교통카드결제
  CVS = "cvs", // 편의점캐시
  EGG_MONEY = "eggmoney", // 에그머니
  ON_CASH = "oncash", // 온캐시
  PHONE_BILL = "phonebill", // 폰빌
  CASH_BEE = "cashbee", // 이즐
  KAKAOPAY = "kakaopay", // 카카오페이
  PAYCO = "payco", // 페이코
  CHECK_PAY = "checkpay", // 체크페이
  TOSS = "toss", // 토스
  SSG_PAY = "ssgpay", // SSG페이
  NAVER_PAY = "naverpay", // 네이버페이
  SAMSUNG_PAY = "samsungpay", // 삼성페이
  APPLE_PAY = "applepay", // 애플페이
}


export interface PayletterRequestPayment{
  token: number;
  online_url: string;
  mobile_url: string;
}