"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { OutputEntry } from "./outputEntry";
import { OutPutDisplay } from "./outputDisplay";
import { OutPutButtons } from "./outButtons";
import { OutPutList } from "./outputList";
import iceCreamsData from "../data/IceCream.json";
import { IceCream as IceCreamType } from "@/lib/types";

type Props = {
  selectedSender: string;
  setSelectedSender: (value: string) => void;
  selectedCompany: string;
  selectedCar: string;
};

export const OutputPanel: React.FC<Props> = ({
  selectedSender,
  setSelectedSender,
  selectedCompany,
  selectedCar,
}) => {
  const [inputValue, setInputValue] = useState("");

  const [orderItems, setOrderItems] = useState<IceCreamType[]>([]);

  const [error, setError] = useState<string | null>(null);

  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (inputValue === "") {
      setDisplayText("");
      return;
    }

    const match = inputValue.match(/^(\d+)\*(\d*)$/);
    if (match) {
      const count = match[1];
      const idPart = match[2];

      if (idPart) {
        const id = Number.parseInt(idPart, 10);
        const iceCream = iceCreamsData.find((ice) => ice.id === id);

        if (iceCream) {
          setDisplayText(`${count}*${iceCream.name}`);
          setError(null);
        } else {
          setDisplayText(inputValue);
          setError(`Kód zmrzliny "${id}" neexistuje`);
        }
      } else {
        setDisplayText(inputValue);
        setError(null);
      }
    } else {
      setDisplayText(inputValue);
      setError(null);
    }
  }, [inputValue]);

  const handleAddItem = () => {
    if (inputValue.trim() === "") return;

    const match = inputValue.trim().match(/^(\d+)\*(\d+)$/);
    if (!match) {
      setError("Nesprávny formát. Použite: počet*kód (napr. 5*1)");
      return;
    }

    const count = Number.parseInt(match[1], 10);
    const id = Number.parseInt(match[2], 10);

    const iceCream = iceCreamsData.find((ice) => ice.id === id);
    if (!iceCream) {
      setError(`Kód zmrzliny "${id}" neexistuje`);
      return;
    }

    const existingItemIndex = orderItems.findIndex((item) => item.id === id);

    if (existingItemIndex !== -1) {
      setOrderItems((prev) => {
        const newItems = [...prev];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          amount: newItems[existingItemIndex].amount + count,
        };
        return newItems;
      });
    } else {
      setOrderItems((prev) => [...prev, { ...iceCream, amount: count }]);
    }

    setInputValue("");
    setDisplayText("");
    setError(null);
  };

  const handleIncreaseAmount = (index: number) => {
    setOrderItems((prev) => {
      const newItems = [...prev];
      newItems[index] = {
        ...newItems[index],
        amount: newItems[index].amount + 1,
      };
      return newItems;
    });
  };

  const handleDecreaseAmount = (index: number) => {
    setOrderItems((prev) => {
      const newItems = [...prev];
      if (newItems[index].amount > 1) {
        newItems[index] = {
          ...newItems[index],
          amount: newItems[index].amount - 1,
        };
      }
      return newItems;
    });
  };

  const handleRemoveSpecificItem = (index: number) => {
    setOrderItems((prev) => {
      const newItems = [...prev];
      newItems.splice(index, 1);
      return newItems;
    });
  };

  return (
    <div className="flex flex-col w-1/3 bg-white text-black p-4 rounded-lg shadow-lg ">
      <OutputEntry
        inputValue={inputValue}
        setInputValue={(value: string) => {
          setInputValue(value);
        }}
        onEnterPress={handleAddItem}
      />
      <div className="mt-4">
        <OutPutDisplay
          selectedItem={
            orderItems.length > 0 ? orderItems[orderItems.length - 1] : null
          }
          error={error}
          displayText={displayText}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-2 justify-center mt-4 mb-4 w-full">
        <OutPutButtons
          onAdd={handleAddItem}
          onRemove={() => setOrderItems((prev) => prev.slice(0, -1))}
          items={orderItems}
          selectedSender={selectedSender}
          selectedCompany={selectedCompany}
          selectedCar={selectedCar}
        />
      </div>

      <OutPutList
        items={orderItems}
        onIncreaseAmount={handleIncreaseAmount}
        onDecreaseAmount={handleDecreaseAmount}
        onRemoveItem={handleRemoveSpecificItem}
      />
    </div>
  );
};
