import { FC, useEffect, useState } from "react";
import { OutputPanel } from "./outputPanel";
import { InputPanel } from "./allinputs";
import AllIceCreamList from "./iceCreamList";
import { useToggle } from "usehooks-ts";

export const IndexPage: FC = () => {
  const [selectedSender, setSelectedSender] = useState<string>("");
  const [selectedCar, setSelectedCar] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [shouldTriggerSync, setTriggerSync] = useToggle();

  useEffect(() => {
    console.log("shouldTriggerSync");
  }, [shouldTriggerSync]);

  // Set up main process log listener
  useEffect(() => {
    const handleMainProcessLog = (log: {
      level: string;
      message: string;
      data?: unknown;
      timestamp: string;
    }) => {
      const timestamp = new Date(log.timestamp).toLocaleTimeString();
      const style =
        log.level === "error"
          ? "color: red; font-weight: bold"
          : "color: #4CAF50";

      console.log(
        `%c[${timestamp}] Main Process [${log.level.toUpperCase()}]: ${
          log.message
        }`,
        style
      );
      if (log.data) {
        console.log("%cData:", "color: #2196F3", log.data);
      }
    };

    const logAppVersion = async () => {
      try {
        const version = await window.electron.invoke("get-app-version");
        console.log(
          `%cApp Version: ${version}`,
          "color: #FF9800; font-weight: bold; font-size: 14px;"
        );
      } catch (error) {
        console.error("Failed to get app version:", error);
      }
    };

    // Log app version
    logAppVersion();

    // Set up the listener
    window.electron.onMainProcessLog(handleMainProcessLog);

    // Cleanup on unmount
    return () => {
      window.electron.removeMainProcessLogListener();
    };
  }, []);

  return (
    <div className="flex flex-col w-full h-screen bg-[#10162F] text-white">
      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1 p-4 gap-4 overflow-auto">
        <AllIceCreamList />
        <OutputPanel
          selectedSender={selectedSender}
          setSelectedSender={setSelectedSender}
          selectedCompany={selectedCompany}
          selectedCar={selectedCar}
          shouldTriggerSync={shouldTriggerSync}
          setTriggerSync={setTriggerSync}
        />
        <InputPanel
          selectedSender={selectedSender}
          setSelectedSender={setSelectedSender}
          selectedCar={selectedCar}
          setSelectedCar={setSelectedCar}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          shouldTriggerSync={shouldTriggerSync}
          setTriggerSync={setTriggerSync}
        />
      </div>
    </div>
  );
};
