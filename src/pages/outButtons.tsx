import React, { useState, useEffect } from "react";
import { Car, Company, IceCream, Sender } from "@/lib/types";
import { Button } from "@/components/ui/button";
//import { outputZuzana } from "./outButtonTestData";

type Props = {
  onAdd: () => void;
  onRemove: () => void;
  items: IceCream[];
  selectedSender: string;
  selectedCompany: string;
  selectedCar: string;
  shouldTriggerSync: boolean;
  setTriggerSync: () => void;
};

export const OutPutButtons: React.FC<Props> = ({
  onAdd,
  onRemove,
  items,
  selectedSender,
  selectedCompany,
  selectedCar,
  shouldTriggerSync,
  setTriggerSync,
}) => {
  const [personData, setPersonData] = useState<Sender[]>([]);
  const [senderReceiverData, setSenderReceiverData] = useState<Company[]>([]);
  const [CarsData, setCarsData] = useState<Car[]>([]);

  const loadData = async () => {
    try {
      const [personalData, clientsData, carsData] = await Promise.all([
        window.electron.invoke("get-personal-data"),
        window.electron.invoke("get-clients-data"),
        window.electron.invoke("get-cars-data"),
      ]);
      setPersonData(personalData);
      setSenderReceiverData(clientsData);
      setCarsData(carsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [shouldTriggerSync]);

  const senderDetails = personData.find(
    (person) => person.name === selectedSender
  );
  const companyDetails = senderReceiverData.find(
    (c) => c.nick === selectedCompany
  );
  const carDetails = CarsData.find((c) => c.carName === selectedCar);

  const updateSender = async (forInvoice: boolean) => {
    console.log("Updating sender details...", senderDetails);
    const sender: Sender = {
      ...senderDetails,
      lastID: forInvoice ? senderDetails.lastID : senderDetails.lastID + 1,
      invoiceLastID: forInvoice
        ? senderDetails.invoiceLastID + 1
        : senderDetails.invoiceLastID,
    };

    console.log("Updating sender details:", sender);

    await window.electron.invoke("update-sender", sender);
    setTriggerSync();
    loadData();
  };

  const printInvoice = async () => {
    console.log("Printing invoice");
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

      await updateSender(true);

      const result = await window.electron.invoke(
        "generate-and-open-excel-invoice",
        output
      );

      if (!result.success) {
        alert("Chyba: " + result.error);
      }
    } catch (err) {
      console.error("IPC chyba:", err);
    }
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

      await updateSender(false);

      const result = await window.electron.invoke(
        "generate-and-open-excel",
        output // outputZuzana for testing
      );

      if (!result.success) {
        alert("Chyba: " + result.error);
      }
    } catch (err) {
      console.error("IPC chyba:", err);
    }
  };

  // const exportAsPdf = async () => {
  //   try {
  //     const output: {
  //       items: IceCream[];
  //       senderId: number;
  //       car: Car;
  //       company: Company;
  //     } = {
  //       items,
  //       senderId: senderDetails.id,
  //       car: carDetails,
  //       company: companyDetails,
  //     };

  //     await updateSender(false);

  //     const result = await window.electron.invoke("export-to-pdf", output);
  //     if (result.canceled) {
  //       return;
  //     }
  //     if (!result.success) {
  //       alert("Chyba pri ukladaní PDF: " + result.error);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert("Chyba pri exporte do PDF.");
  //   }
  // };

  const printData = async () => {
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

      await updateSender(false);

      const result = await window.electron.invoke("print-data", output);
      if (result.canceled) {
        return;
      }
      if (!result.success) {
        alert("Chyba pri tlači: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Chyba pri tlači.");
    }
  };

  return (
    <div className="flex flex-col flex-wrap sm:flex-row gap-2 w-full">
      <Button
        onClick={onAdd}
        className="bg-orange-500 text-white p-2 rounded flex-1 min-w-[80px] hover:cursor-pointer"
      >
        Pridať
      </Button>
      <Button
        onClick={onRemove}
        className="bg-orange-500 text-white p-2 rounded flex-1 min-w-[80px] hover:cursor-pointer"
      >
        Odstrániť
      </Button>
      <Button
        onClick={openTemplatePreview}
        className="bg-orange-500 text-white p-2 rounded flex-1 min-w-[80px] hover:cursor-pointer"
      >
        Náhľad
      </Button>
      <Button
        onClick={printData}
        className="bg-orange-500 text-white p-2 rounded flex-1 min-w-[80px] hover:cursor-pointer"
      >
        Tlačiť
      </Button>
      <Button
        onClick={printInvoice}
        className="bg-orange-500 text-white p-2 rounded flex-1 min-w-[80px] hover:cursor-pointer"
      >
        Tlačiť Fakturu
      </Button>
    </div>
  );
};
