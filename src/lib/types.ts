export type IceCream = {
  id: number;
  name: string;
  type: string;
  amount: number;
};

export type Sender = {
  id: number;
  companyName: string;
  name: string;
  lastname: string;
  city: string;
  street: string;
  psc: string;
  state: string;
  ico: string;
  dic: string;
  icdph: string;
  www: string;
  phonenumber: string;
  email: string;
  email2: string;
  priceN: number;
  priceS: number;
  lastID: number;
  yearOFLastID: number;
  invoiceLastID: number;
  invoiceYearOFLastID: number;
  isDPHPayer: boolean;
};

export type Car = {
  licensePlate: string;
  carName: string;
};

export type Company = {
  id: number;
  nick: string;
  name: string;
  lastname: string;
  shopName: string;
  street: string;
  city: string;
  phonenumber: string;
  psc: string;
  state: string;
  ico: string;
  dic: string;
};
