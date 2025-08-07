import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  invoke: (channel: string, data?: unknown) =>
    ipcRenderer.invoke(channel, data),
  onMainProcessLog: (
    callback: (log: {
      level: string;
      message: string;
      data?: unknown;
      timestamp: string;
    }) => void
  ) => {
    ipcRenderer.on("main-process-log", (_event, log) => callback(log));
  },
  removeMainProcessLogListener: () => {
    ipcRenderer.removeAllListeners("main-process-log");
  },
});
