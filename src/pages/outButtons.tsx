import React from "react";
import { Car, Company, IceCream, Sender } from "@/lib/types";
import personData from "../data/PersonalData.json";
import senderReceiverData from "../data/Clients.json";
import CarsData from "../data/Cars.json";

type Props = {
  onAdd: () => void;
  onRemove: () => void;
  items: IceCream[];
  selectedSender: string;
  selectedCompany: string;
  selectedCar: string;
};

export const OutPutButtons: React.FC<Props> = ({
  onAdd,
  onRemove,
  items,
  selectedSender,
  selectedCompany,
  selectedCar,
}) => {
  const senderDetails = personData.find(
    (person) => person.name === selectedSender
  );
  const companyDetails = senderReceiverData.find(
    (c) => c.nick === selectedCompany
  );
  const carDetails = CarsData.find((c) => c.carName === selectedCar);

  const updateSender = async () => {
    console.log("Updating sender details...", senderDetails);
    const sender: Sender = {
      ...senderDetails,
      lastID: senderDetails.lastID + 1,
    };

    console.log("Updating sender details:", sender);

    await window.electron.invoke("update-sender", sender);
  };

  const openTemplatePreview = async () => {
    try {
      const output: {
        items: IceCream[];
        senderId: number;
        car: Car;
        company: Company;
      } = {
        items,
        senderId: senderDetails.id,
        car: carDetails,
        company: companyDetails,
      };

      console.log("Output for Excel:", output);

      /* const outputZuzana: {
        items: IceCream[];
        sender: Sender;
        car: Car;
        company: Company;
      } = {
        items: [
          {
            id: 5,
            name: "Čokoláda",
            type: "M",
            amount: 5,
          },
          {
            id: 11,
            name: "Lieskovy orech",
            type: "M",
            amount: 3,
          },
          {
            id: 24,
            name: "Vanilková",
            type: "M",
            amount: 5,
          },
          {
            id: 16,
            name: "Punčová",
            type: "M",
            amount: 2,
          },
          {
            id: 8,
            name: "Karamelová",
            type: "M",
            amount: 1,
          },
          {
            id: 21,
            name: "Šmolková",
            type: "M",
            amount: 2,
          },
          {
            id: 19,
            name: "Straciatella",
            type: "M",
            amount: 1,
          },
          {
            id: 22,
            name: "Tvarohová",
            type: "M",
            amount: 1,
          },
          {
            id: 12,
            name: "Maková",
            type: "M",
            amount: 1,
          },
          {
            id: 4,
            name: "Cappuccino",
            type: "M",
            amount: 2,
          },
          {
            id: 36,
            name: "Citrón",
            type: "F",
            amount: 4,
          },
          {
            id: 58,
            name: "Zelené jablko",
            type: "F",
            amount: 2,
          },
          {
            id: 46,
            name: "Kiwi",
            type: "F",
            amount: 1,
          },
          {
            id: 38,
            name: "Čerešna",
            type: "F",
            amount: 2,
          },
          {
            id: 56,
            name: "Slivka",
            type: "F",
            amount: 2,
          },
          {
            id: 54,
            name: "Papaya",
            type: "F",
            amount: 1,
          },
          {
            id: 43,
            name: "Hrozno",
            type: "F",
            amount: 1,
          },
        ],
        sender: {
			id: 0,
          companyName: "Zuzana Hrotíková",
          name: "Zuzana",
          lastname: "Hrotíková",
          city: "Sasinkovo",
          street: "96",
          psc: "920 65",
          state: "Slovenská Republika",
          ico: "43033270",
          dic: "1032474036",
          icdph: "SK1032474036",
          www: "-1",
          phonenumber: "0907 371 032",
          email: "vanillia@centrum.sk",
          email2: "vanillia706@gmail.com",
          priceN: 38,
          priceS: 48,
          lastID: 4,
          yearOFLastID: 2025,
          isDPHPayer: true,
        },
        car: {
          licensePlate: "HC329CA",
          carName: "Vito",
        },
        company: {
          id: 1,
          nick: "Stankovce",
          shopName: "Cukráreň elli s.r.o",
          name: "Igor",
          lastname: "Minárik",
          city: "Trenčianske Stankovce",
          street: "3088",
          psc: "913 11",
          state: "Slovenská Republika",
          phonenumber: "0905 969 806",
          ico: "51279711",
          dic: "2120653612",
        },
      };

      const outputPeter: {
        items: IceCream[];
        sender: Sender;
        car: Car;
        company: Company;
      } = {
        items: [
          {
            id: 5,
            name: "Čokoláda",
            type: "M",
            amount: 5,
          },
          {
            id: 16,
            name: "Punčová",
            type: "M",
            amount: 2,
          },
          {
            id: 24,
            name: "Vanilková",
            type: "M",
            amount: 2,
          },
          {
            id: 7,
            name: "Jogurtová",
            type: "M",
            amount: 3,
          },
          {
            id: 36,
            name: "Citrón",
            type: "F",
            amount: 3,
          },
          {
            id: 45,
            name: "Jahoda",
            type: "F",
            amount: 3,
          },
        ],
        sender: {
		id: 1,
          companyName: "Peter Hrotík-Vanilia",
          name: "Peter",
          lastname: "Hrotík",
          city: "Sasinkovo",
          street: "96",
          psc: "920 65",
          state: "Slovenská Republika",
          ico: "34305581",
          dic: "6611066495",
          icdph: "SK6611066495",
          www: "-1",
          phonenumber: "0905 230 476",
          email: "vanillia@centrum.sk",
          email2: "vanillia706@gmail.com",
          priceN: 38,
          priceS: 48,
          lastID: 3,
          yearOFLastID: 2025,
          isDPHPayer: false,
        },
        car: {
          licensePlate: "HC329CA",
          carName: "Vito",
        },
        company: {
          id: 1,
          nick: "Stankovce",
          shopName: "Cukráreň elli s.r.o",
          name: "Igor",
          lastname: "Minárik",
          city: "Trenčianske Stankovce",
          street: "3088",
          psc: "913 11",
          state: "Slovenská Republika",
          phonenumber: "0905 969 806",
          ico: "51279711",
          dic: "2120653612",
        },
      }; */

      await updateSender();

      const result = await window.electron.invoke(
        "generate-and-open-excel",
        output
      );

      if (!result.success) {
        alert("Chyba: " + result.error);
      }
    } catch (err) {
      console.error("IPC chyba:", err);
    }
  };

  const exportAsPdf = async () => {
    try {
      const output: {
        items: IceCream[];
        sender: Sender;
        car: Car;
        company: Company;
      } = {
        items,
        sender: senderDetails,
        car: carDetails,
        company: companyDetails,
      };

      await updateSender();

      const result = await window.electron.invoke("export-to-pdf", output);
      if (result.canceled) {
        return;
      }
      if (!result.success) {
        alert("Chyba pri ukladaní PDF: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Chyba pri exporte do PDF.");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <button
        onClick={onAdd}
        className="bg-orange-500 text-white p-2 rounded flex-1 min-w-[100px]"
      >
        Pridať
      </button>
      <button
        onClick={onRemove}
        className="bg-orange-500 text-white p-2 rounded flex-1 min-w-[100px]"
      >
        Odstrániť
      </button>
      <button
        onClick={openTemplatePreview}
        className="bg-orange-500 text-white p-2 rounded flex-1 min-w-[100px]"
      >
        Náhľad
      </button>
      <button
        onClick={exportAsPdf}
        className="bg-orange-500 text-white p-2 rounded flex-1 min-w-[100px]"
      >
        Tlačiť
      </button>
    </div>
  );
};
