"use client";

import React from "react";
import { IceCream } from "@/lib/types";

type Props = {
  items: IceCream[];
  onIncreaseAmount: (index: number) => void;
  onDecreaseAmount: (index: number) => void;
  onRemoveItem: (index: number) => void;
};

export const OutPutList: React.FC<Props> = ({
  items,
  onIncreaseAmount,
  onDecreaseAmount,
  onRemoveItem,
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg text-gray-500 text-center min-h-0 p-4 flex-1">
        Žiadne položky v objednávke
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4 flex-1 flex flex-col min-h-0">
      <h3 className="font-bold mb-2">Objednávka:</h3>
      <div className="pr-2 flex-1 overflow-y-auto min-h-0">
        <ul className="divide-y divide-gray-200">
          {items.map((item, index) => (
            <li
              key={`${item.id}-${index}`}
              className="py-2 flex items-center justify-between"
            >
              <div>
                <span className="font-medium">{item.amount}×</span> {item.name}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onDecreaseAmount(index)}
                  className="p-1 bg-white rounded hover:bg-gray-300"
                  disabled={item.amount <= 1}
                  aria-label="Znížiť množstvo"
                >
                  -
                </button>
                <button
                  onClick={() => onIncreaseAmount(index)}
                  className="p-1 bg-white rounded hover:bg-gray-300"
                  aria-label="Zvýšiť množstvo"
                >
                  +
                </button>
                <button
                  onClick={() => onRemoveItem(index)}
                  className="p-1 bg-red-100 rounded hover:bg-red-200 text-red-600"
                  aria-label="Odstrániť položku"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-2 text-right font-bold border-t border-gray-200 pt-2">
        Celkom: {items.reduce((total, item) => total + item.amount, 0)} ks
      </div>
    </div>
  );
};
