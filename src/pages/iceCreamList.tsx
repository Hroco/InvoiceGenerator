import React, { useState, useEffect } from "react";
import { IceCream } from "../lib/types";
import { cn } from "@/lib/utils";

export default function AllIceCreamList() {
  const [iceCreamsData, setIceCreamsData] = useState<IceCream[]>([]);

  // Load ice cream data on component mount
  useEffect(() => {
    const loadIceCreamData = async () => {
      try {
        const data = await window.electron.invoke("get-ice-cream-data");
        setIceCreamsData(data);
      } catch (error) {
        console.error("Failed to load ice cream data:", error);
      }
    };

    loadIceCreamData();
  }, []);

  return (
    <div className="flex flex-col w-full md:w-1/3 bg-white rounded-xl shadow-lg overflow-auto">
      <div className="max-h-full overflow-hidden flex flex-wrap">
        <IceCreamListItem
          title="Mliečne zmrzliny"
          items={iceCreamsData.filter((ice) => ice.type === "M")}
          className="pl-4 pt-4 pr-2 pb-2"
        />
        <IceCreamListItem
          title="Ovocné zmrzliny"
          items={iceCreamsData.filter((ice) => ice.type === "F")}
          className="pr-4 pt-4 pl-2 pb-2"
        />
        <IceCreamListItem
          title="Špeciálne zmrzliny"
          items={iceCreamsData.filter((ice) => ice.type === "I")}
          className="pl-4 pb-4 pr-2 pt-2"
        />
        <IceCreamListItem
          title="Sorbety"
          items={iceCreamsData.filter((ice) => ice.type === "S")}
          className="pr-4 pb-4 pl-2 pt-2"
        />
      </div>
    </div>
  );
}

function IceCreamListItem({
  title,
  items,
  className,
}: {
  title: string;
  items: IceCream[];
  className: string;
}) {
  return (
    <div className={cn(`bg-white flex flex-col h-1/2 w-1/2`, className)}>
      <div className="border border-gray-300 rounded-xl h-full overflow-hidden">
        <h3 className="text-base p-2 bg-gray-100 text-gray-900 font-semibold border-b border-gray-300 rounded-t-xl">
          {title}
        </h3>
        <div className="flex-1 bg-orange-50 overflow-y-auto p-2 h-full">
          <div>
            {items.map((item) => (
              <div
                key={item.id}
                className="text-gray-800 text-xs font-bold cursor-pointer hover:bg-orange-200 p-1 rounded"
              >
                {item.id} – {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
