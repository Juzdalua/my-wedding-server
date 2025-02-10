import axios from 'axios';
import { PaymentCode } from 'src/types/PayLetter.types';

// https://www.payletter.com/ko/technical/index#integration-preparation
class PayLetter {
  public static instance: PayLetter;
  private PAYLETTER_BASE_URL = 'https://testpgapi.payletter.com';
  private PAYLETTER_CLIENT_ID = 'pay_test';
  private PAYLETTER_API_KEY_PAYMENT = `PLKEY MTFBNTAzNTEwNDAxQUIyMjlCQzgwNTg1MkU4MkZENDA=`;
  private PAYLETTER_API_KEY_SEARCH = `PLKEY MUI3MjM0RUExQTgyRDA1ODZGRDUyOEM4OTY2QTVCN0Y=`;

  // private PAYLETTER_API_KEY_PAYMENT = `PLKEY a`;
  // private PAYLETTER_API_KEY_SEARCH = `PLKEY a`;
  // private PAYLETTER_BASE_URL = "https://pgapi.payletter.com";
  // private PAYLETTER_CLIENT_ID = "";

  constructor() {}

  public static getInstance(): PayLetter {
    if (!this.instance) {
      this.instance = new PayLetter();
    }
    return this.instance;
  }

  /**
   * https://www.payletter.com/ko/technical/index#payment-request
   * 결제 요청
   * @param pgcode
   * @param product_name
   * @param user_id
   * @param amount
   * @returns
   */
  public async reqPayment(pgcode: PaymentCode, product_name: string, amount: number, user_id: string, email: string, custom_parameter: string): Promise<any> {
    try {
      const res = await axios({
        method: 'post',
        url: `${this.PAYLETTER_BASE_URL}/v1.0/payments/request`,
        headers: {
          Authorization: this.PAYLETTER_API_KEY_PAYMENT,
          'Content-Type': 'application/json'
        },
        data: {
          pgcode, // 필수
          client_id: this.PAYLETTER_CLIENT_ID, // 필수
          amount, //필수
          product_name, //필수
          user_id: email, // 필수 - email or id
          user_name: user_id,
          service_name: '페이레터',
          order_no: '1234567890',
          taxfree_amount: 100,
          tax_amount: 20,
          email_flag: 'Y',
          email_addr: email,
          autopay_flag: 'N',
          receipt_flag: 'Y',
          custom_parameter,
          return_url: `${"http://localhost:3400/api/"}charge/payletter/return`, // 필수
          callback_url: `${"http://localhost:3400/api/"}charge/payletter/callback`, // 필수
          cancel_url: `${"http://localhost:3400/api/"}charge/payletter/cancel`
        }
      });

      return res.data;
    } catch (error) {
      console.log(`Request Payment Error: ${error}`);
      return {
        success: false,
        error: {
          msg: error,
          code: -1
        }
      };
    }
  }

  /**
   * 결제 취소
   * @param pgcode
   * @param user_id
   * @param tid
   * @param ip_addr
   * @returns
   */
  public async cancelPayment(pgcode: PaymentCode, user_id: string, tid: string, ip_addr: string) {
    try {
      const res = await axios({
        method: 'post',
        url: `${this.PAYLETTER_BASE_URL}/v1.0/payments/cancel`,
        headers: {
          Authorization: this.PAYLETTER_API_KEY_PAYMENT,
          'Content-Type': 'application/json'
        },
        data: {
          pgcode,
          client_id: this.PAYLETTER_CLIENT_ID,
          user_id,
          tid,
          ip_addr
        }
      });

      return {
        success: true,
        code: res.data.code ?? null,
        message: res.data.message ?? null,
        tid: res.data.tid,
        cid: res.data.cid,
        amount: res.data.amount,
        cancel_date: res.data.cancel_date
      };
    } catch (error) {
      console.log(`Request Payment Error: ${error}`);
      return {
        success: false,
        error: {
          msg: error,
          code: -1
        }
      };
    }
  }

  /**
   * 결제 내역 조회
   * @param date
   * @param date_type
   * @returns
   */
  public async searchPaymentList(date: string, date_type: string = 'transaction') {
    try {
      let url = `${this.PAYLETTER_BASE_URL}/v1.0/payments/transaction/list`;
      url += `?client_id=${this.PAYLETTER_CLIENT_ID}&date=${date.replace(/-/g, '')}&date_type=${date_type}`;

      const res = await axios({
        method: 'get',
        url,
        headers: {
          Authorization: this.PAYLETTER_API_KEY_SEARCH
        }
      });

      return {
        success: true,
        data: res.data
        /*
          {
            "total_count": 2,
            "list": [
              {
                "pgcode": "oncash",
                "user_id": "test_user_id",
                "user_name": "테스터",
                "tid": "tpay_test-201809142506687",
                "cid": "2506686",
                "amount": 1000,
                "taxfree_amount": 100,
                "tax_amount": 20,
                "order_no": "1234567890",
                "product_name": "테스트상품",
                "status_code": 1,
                "transaction_date": "2018-09-14 17:25:36",
                "cancel_date": "2018-09-18 09:52:29"
              },
              {
                "pgcode": "mobile",
                "user_id": "test_user_id",
                "user_name": "테스터",
                "tid": "tpay_test-201809182509659",
                "cid": "20180918095312998861",
                "amount": 100,
                "taxfree_amount": 100,
                "tax_amount": 20,
                "order_no": "1234567890",
                "product_name": "테스트상품",
                "status_code": 2,
                "transaction_date": "2018-09-18 09:53:25",
                "cancel_date": "2018-09-18 09:54:01"
              }
            ]
          }
        */
      };
    } catch (error) {
      console.log(`Request Payment Error: ${error}`);
      return {
        success: false,
        error: {
          msg: error,
          code: -1
        }
      };
    }
  }

  /**
   * 거래 상태 조회
   * @param order_no
   * @returns
   */
  public async searchPaymentStatus(order_no: string) {
    try {
      const res = await axios({
        method: 'post',
        url: `${this.PAYLETTER_BASE_URL}/v1.0/payments/status`,
        headers: {
          Authorization: this.PAYLETTER_API_KEY_SEARCH,
          'Content-Type': 'application/json'
        },
        data: {
          client_id: this.PAYLETTER_CLIENT_ID,
          order_no
        }
      });

      /*
        status_code: 1-생성 2-진입 3-인중 4-실패 5-완료
      */

      return {
        success: true,
        data: res.data
        /*
          {
            "code" :0,
            "message":"ok",
            "client_id":"pay_test",
            "order_no":"pay_test2023118164578",
            "token":"170202154314200189",
            "tid":"tpay_test-202312082315563",
            "status_code":5
          }
        */
      };
    } catch (error) {
      console.log(`Request Payment Error: ${error}`);
      return {
        success: false,
        error: {
          msg: error,
          code: -1
        }
      };
    }
  }
}

export default PayLetter;
