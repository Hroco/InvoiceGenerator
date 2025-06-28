import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sender } from "@/lib/types";
import type React from "react";
import { useEffect, useState } from "react";

type Props = {
  selectedSender: string;
  shouldTriggerSync: boolean;
  setTriggerSync: () => void;
};

export const IDInputs: React.FC<Props> = ({
  selectedSender,
  shouldTriggerSync,
  setTriggerSync,
}) => {
  const [personData, setPersonData] = useState<Sender[]>([]);
  const [currentSender, setCurrentSender] = useState<Sender | null>(null);

  const loadData = async () => {
    try {
      const personalData = await window.electron.invoke("get-personal-data");
      setPersonData(personalData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [shouldTriggerSync]);

  useEffect(() => {
    if (selectedSender) {
      const sender = personData.find((p) => p.name === selectedSender);
      if (sender) {
        setCurrentSender(sender);
      } else {
        console.warn(`Sender with name ${selectedSender} not found`);
        setCurrentSender(null);
      }
    } else {
      setCurrentSender(null);
    }
  }, [selectedSender, personData]);

  const updateSender = async (inputSender: Sender) => {
    console.log("updateSender", inputSender);

    await window.electron.invoke("update-sender", inputSender);
    setTriggerSync();

    loadData();
  };

  return (
    <div className=" text-gray-700">
      <Label>Dodacie listy</Label>
      <div className="flex gap-2 mb-2">
        <Input
          type="number"
          className="mb-2"
          value={currentSender?.lastID + 1}
          onChange={(e) => {
            if (currentSender) {
              const data = {
                ...currentSender,
                lastID: Number(e.target.value) - 1,
              };
              setCurrentSender(data);
              updateSender(data);
            }
          }}
        />
        <span>/</span>
        <Input
          type="number"
          className="mb-2"
          value={currentSender?.yearOFLastID}
          readOnly
        />
      </div>
      <Label>Faktury</Label>
      <div className="flex gap-2 mb-2">
        <Input
          type="number"
          className="mb-2"
          value={currentSender?.invoiceLastID + 1}
          onChange={(e) => {
            if (currentSender) {
              const data = {
                ...currentSender,
                invoiceLastID: Number(e.target.value) - 1,
              };
              setCurrentSender(data);
              updateSender(data);
            }
          }}
        />
        <span>/</span>
        <Input
          type="number"
          className="mb-2"
          value={currentSender?.invoiceYearOFLastID}
          readOnly
        />
      </div>
    </div>
  );
};
