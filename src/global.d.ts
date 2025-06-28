import { Car, Company, IceCream, Sender } from "./lib/types";

declare global {
  interface Window {
    electron: {
      invoke(channel: "get-ice-cream-data"): Promise<IceCream[]>;
      invoke(channel: "get-personal-data"): Promise<Sender[]>;
      invoke(channel: "get-clients-data"): Promise<Company[]>;
      invoke(channel: "get-cars-data"): Promise<Car[]>;
      invoke(channel: "generate-and-open-excel", data: any): Promise<any>;
      invoke(
        channel: "generate-and-open-excel-invoice",
        data: any
      ): Promise<any>;
      invoke(channel: "export-to-pdf", data: any): Promise<any>;
      invoke(channel: "update-sender", data: Sender): Promise<any>;
      invoke(channel: string, data?: any): Promise<any>;
    };
  }
}
export {};
