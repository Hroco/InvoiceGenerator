import { Car, Company, IceCream, Sender } from "../lib/types";
import { dialog, shell, app } from "electron";
import path from "path";
import os from "os";
import fs from "fs";
import ExcelJS from "exceljs";
import isDev from "electron-is-dev";
import { spawn } from "child_process";

// Data management functions
const APP_DATA_FOLDER = "InvoiceGenerator";
const DATA_FILES = [
  "Cars.json",
  "Clients.json",
  "IceCream.json",
  "PersonalData.json",
  "Template.xlsx",
  "Proj_IceCream.ico",
];

function getDocumentsDataPath(): string {
  const documentsPath = path.join(os.homedir(), "Documents", APP_DATA_FOLDER);
  return documentsPath;
}

function getSourceDataPath(): string {
  return isDev
    ? path.join(__dirname, "..", "..", "src", "data")
    : path.join(process.resourcesPath, "data");
}

function getDataFilePath(fileName: string): string {
  return path.join(getDocumentsDataPath(), fileName);
}

async function ensureDocumentsDataFolder(): Promise<void> {
  const documentsDataPath = getDocumentsDataPath();

  if (!fs.existsSync(documentsDataPath)) {
    fs.mkdirSync(documentsDataPath, { recursive: true });
    console.log(`Created data folder at: ${documentsDataPath}`);
  }
}

async function copyDataFiles(): Promise<void> {
  const sourceDataPath = getSourceDataPath();
  const documentsDataPath = getDocumentsDataPath();

  for (const fileName of DATA_FILES) {
    const sourcePath = path.join(sourceDataPath, fileName);
    const destPath = path.join(documentsDataPath, fileName);

    if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
      try {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${fileName} to Documents folder`);
      } catch (error) {
        console.error(`Failed to copy ${fileName}:`, error);
      }
    }
  }
}

export async function initializeDataFiles(): Promise<void> {
  try {
    console.log("Initializing data files...");
    await ensureDocumentsDataFolder();
    await copyDataFiles();
    console.log("Data files initialization completed successfully");
    console.log("Data folder location:", getDocumentsDataPath());
  } catch (error) {
    console.error("Failed to initialize data files:", error);
  }
}

// Data loading functions for frontend
export function getAppVersion(): string {
  try {
    return app.getVersion();
  } catch (error) {
    console.error("Failed to get app version:", error);
    return "Unknown";
  }
}

export function getIceCreamData(): IceCream[] {
  try {
    const filePath = getDataFilePath("IceCream.json");
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    return [];
  } catch (error) {
    console.error("Failed to load IceCream data:", error);
    return [];
  }
}

export function getPersonalData(): Sender[] {
  try {
    const filePath = getDataFilePath("PersonalData.json");
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    return [];
  } catch (error) {
    console.error("Failed to load PersonalData:", error);
    return [];
  }
}

export function getClientsData(): Company[] {
  try {
    const filePath = getDataFilePath("Clients.json");
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    return [];
  } catch (error) {
    console.error("Failed to load Clients data:", error);
    return [];
  }
}

export function getCarsData(): Car[] {
  try {
    const filePath = getDataFilePath("Cars.json");
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    return [];
  } catch (error) {
    console.error("Failed to load Cars data:", error);
    return [];
  }
}

// Data saving functions
export function saveIceCreamData(data: IceCream[]): boolean {
  try {
    const filePath = getDataFilePath("IceCream.json");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Failed to save IceCream data:", error);
    return false;
  }
}

export function saveClientsData(data: Company[]): boolean {
  try {
    const filePath = getDataFilePath("Clients.json");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Failed to save Clients data:", error);
    return false;
  }
}

export function saveCarsData(data: Car[]): boolean {
  try {
    const filePath = getDataFilePath("Cars.json");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Failed to save Cars data:", error);
    return false;
  }
}

function processSummaryRow(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  items: IceCream[],
  sumTotalPriceWithDPH: number,
  sumTotalPriceWithoutDPH: number,
  sumDPHFromTotalPrice: number,
  isDPHPayer: boolean
) {
  const MAXITEMSPERPAGE = 26; // Maximum items per page without Summary row
  const totalKs = items.reduce((sum, item) => sum + item.amount, 0);

  const numberOfItems =
    items.length > MAXITEMSPERPAGE && items.length <= 30
      ? 30 + 12
      : items.length > 30
      ? items.length + 12
      : items.length;

  const summaryRowLineBegin = sheet.getRow(startRow + numberOfItems);
  const summaryRow = sheet.getRow(startRow + numberOfItems + 1);
  const summaryRow2 = sheet.getRow(startRow + numberOfItems + 2);
  const summaryRowLineEnd = sheet.getRow(startRow + numberOfItems + 3);

  summaryRowLineBegin.getCell(2).value =
    "---------------------------------------------------------------------------------------------------------------------------------------------";

  summaryRow.getCell(2).value = "Spolu";

  if (isDPHPayer) {
    summaryRow.getCell(4).value = totalKs.toFixed(2) + " ks";
    summaryRow.getCell(8).value = sumTotalPriceWithoutDPH.toFixed(2) + " €";
    summaryRow.getCell(9).value = sumDPHFromTotalPrice.toFixed(2) + " €";
  } else {
    summaryRow.getCell(8).value = totalKs.toFixed(2) + " ks";
  }

  summaryRow.getCell(10).value = sumTotalPriceWithDPH.toFixed(2) + " €";

  const totalM =
    items.reduce((sum, item) => {
      return item.type == "M" ? sum + item.amount : sum;
    }, 0) * 4;

  const totalI =
    items.reduce((sum, item) => {
      return item.type == "I" ? sum + item.amount : sum;
    }, 0) * 4;

  const totalS =
    items.reduce((sum, item) => {
      return item.type == "S" ? sum + item.amount : sum;
    }, 0) * 4;

  const totalF =
    items.reduce((sum, item) => {
      return item.type == "F" ? sum + item.amount : sum;
    }, 0) * 4;

  summaryRow2.getCell(2).value = "Spolu v litroch:";
  summaryRow2.getCell(3).value = "Mliečne:";
  summaryRow2.getCell(4).value = totalM + "l";
  summaryRow2.getCell(5).value = "Prekladané:";
  summaryRow2.getCell(6).value = totalI + "l";
  summaryRow2.getCell(7).value = "Ovocné:";
  summaryRow2.getCell(8).value = totalF + "l";
  summaryRow2.getCell(9).value = "Sorbety:";
  summaryRow2.getCell(10).value = totalS + "l";

  summaryRowLineEnd.getCell(2).value =
    "---------------------------------------------------------------------------------------------------------------------------------------------";

  summaryRow.commit();
  summaryRow2.commit();

  summaryRowLineBegin.commit();
  summaryRowLineEnd.commit();
}

function processItemHeader(sheet: ExcelJS.Worksheet, isDPHPayer: boolean) {
  sheet.getRow(18).getCell(2).value = "Názov položky";

  if (isDPHPayer) {
    sheet.getRow(17).getCell(4).value = "Počet";
    sheet.getRow(18).getCell(4).value = "ks";
    sheet.getRow(17).getCell(5).value = "Cena/ks";
    sheet.getRow(18).getCell(4).value = "bez DPH";
    sheet.getRow(18).getCell(5).value = "s DPH";
    sheet.getRow(17).getCell(6).value = "Cena/ks";
    sheet.getRow(18).getCell(6).value = "s DPH";
    sheet.getRow(18).getCell(7).value = "DPH %";
    sheet.getRow(17).getCell(8).value = "Cena";
    sheet.getRow(18).getCell(8).value = "bez DPH";
    sheet.getRow(17).getCell(9).value = "DPH z";
    sheet.getRow(18).getCell(9).value = "ceny";
  } else {
    sheet.getRow(17).getCell(8).value = "Počet";
    sheet.getRow(18).getCell(8).value = "ks";
    sheet.getRow(17).getCell(9).value = "Cena/ks";
    sheet.getRow(18).getCell(9).value = "s DPH";
  }

  sheet.getRow(17).getCell(10).value = "Cena";
  sheet.getRow(18).getCell(10).value = "s DPH";
}

function processCompanyHeader(sheet: ExcelJS.Worksheet, company: Company) {
  sheet.getRow(11).getCell(5).value = company.shopName;
  sheet.getRow(12).getCell(5).value = company.name + " " + company.lastname;
  sheet.getRow(13).getCell(5).value =
    company.city + " , " + company.street + " , " + company.psc;
  sheet.getRow(14).getCell(8).value = company.ico;
  sheet.getRow(15).getCell(8).value = company.dic;
  sheet.getRow(15).getCell(5).value = "Mobil: " + company.phonenumber;
}

function processSenderHeader(sheet: ExcelJS.Worksheet, sender: Sender) {
  sheet.getRow(3).getCell(3).value = sender.name + " " + sender.lastname;
  sheet.getRow(4).getCell(3).value = sender.city + "  " + sender.street;
  sheet.getRow(5).getCell(3).value = sender.psc;
  sheet.getRow(6).getCell(3).value = sender.state;
  sheet.getRow(3).getCell(5).value =
    "Meno: " + sender.name + " " + sender.lastname;
  sheet.getRow(4).getCell(5).value = "IČO: " + sender.ico;
  sheet.getRow(4).getCell(7).value = "mobil: ";
  sheet.getRow(4).getCell(8).value = sender.phonenumber;
  sheet.getRow(5).getCell(5).value = "DIC: " + sender.dic;
  sheet.getRow(6).getCell(5).value = "IČ DPH: " + sender.icdph;

  sheet.getRow(54).getCell(5).value =
    "Meno: " + sender.name + " " + sender.lastname;
  sheet.getRow(55).getCell(5).value = "IČO: " + sender.ico;
  sheet.getRow(55).getCell(7).value = "mobil: ";
  sheet.getRow(55).getCell(8).value = sender.phonenumber;
  sheet.getRow(56).getCell(5).value = "DIC: " + sender.dic;
  sheet.getRow(57).getCell(5).value = "IČ DPH: " + sender.icdph;
  sheet.getRow(54).getCell(3).value = sender.name + " " + sender.lastname;
  sheet.getRow(55).getCell(3).value = sender.city + "  " + sender.street;
  sheet.getRow(56).getCell(3).value = sender.psc;
  sheet.getRow(57).getCell(3).value = sender.state;
}

function processCarHeader(sheet: ExcelJS.Worksheet, car: Car) {
  sheet.getRow(12).getCell(3).value = car.licensePlate;
}

function processDateHeader(sheet: ExcelJS.Worksheet) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("sk-SK");

  sheet.getRow(14).getCell(3).value = formattedDate;
  sheet.getRow(15).getCell(3).value = formattedDate;
}

function processItemRow(
  sheet: ExcelJS.Worksheet,
  item: IceCream,
  lineIndex: number,
  priceForUnitWithoutDPH: number,
  priceForUnitWithDPH: number,
  DPH: number,
  totalPriceWithoutDPH: number,
  DPHFromTotalPrice: number,
  totalPrice: number,
  isDPHPayer: boolean
) {
  const currentLineIndex = lineIndex > 48 ? lineIndex + 12 : lineIndex;
  const row = sheet.getRow(currentLineIndex);
  if (isDPHPayer) {
    row.getCell(2).value = item.name;
    row.getCell(4).value = item.amount.toFixed(2) + " ks";
    row.getCell(5).value = priceForUnitWithoutDPH.toFixed(2) + " €";
    row.getCell(6).value = priceForUnitWithDPH.toFixed(2) + " €";
    row.getCell(7).value = DPH + "%";
    row.getCell(8).value = totalPriceWithoutDPH.toFixed(2) + " €";
    row.getCell(9).value = DPHFromTotalPrice.toFixed(2) + " €";
    row.getCell(10).value = totalPrice.toFixed(2) + " €";

    row.commit();
  } else {
    row.getCell(2).value = item.name;
    row.getCell(8).value = item.amount.toFixed(2) + " ks";
    row.getCell(9).value = priceForUnitWithDPH.toFixed(2) + " €";
    row.getCell(10).value = totalPrice.toFixed(2) + " €";
    row.commit();
  }
}

function processHeading(
  sheet: ExcelJS.Worksheet,
  sender: Sender,
  asInvoice: boolean
) {
  if (asInvoice) {
    sheet.getRow(8).getCell(2).value =
      "Faktúra č: " + sender.invoiceLastID + "/" + sender.invoiceYearOFLastID;
  } else {
    sheet.getRow(8).getCell(2).value =
      "Dodací list č: " + sender.lastID + "/" + sender.yearOFLastID;
  }
}

export async function processExcel({
  items,
  sender,
  car,
  company,
  templatePath,
  tempPath,
  asInvoice,
}: {
  items: IceCream[];
  sender: Sender;
  car: Car;
  company: Company;
  templatePath: string;
  tempPath: string;
  asInvoice: boolean;
}) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);

  const sheet = workbook.getWorksheet(1);
  const startRow = 19;

  processHeading(sheet, sender, asInvoice);

  processDateHeader(sheet);

  processSenderHeader(sheet, sender);

  processCompanyHeader(sheet, company);

  processCarHeader(sheet, car);

  processItemHeader(sheet, sender.isDPHPayer);

  let sumTotalPriceWithoutDPH = 0;
  let sumTotalPriceWithDPH = 0;
  let sumDPHFromTotalPrice = 0;
  const DPH = 20;
  const DPHCoefficient = (DPH + 100) / 100;

  items.forEach((item, i) => {
    const priceForUnitWithDPH =
      item.type == "S" || item.type == "I" ? sender.priceS : sender.priceN;

    const priceForUnitWithoutDPH = priceForUnitWithDPH / DPHCoefficient;
    const totalPrice = item.amount * priceForUnitWithDPH;

    const totalPriceWithoutDPH = totalPrice / DPHCoefficient;
    const DPHFromTotalPrice = totalPrice - totalPriceWithoutDPH;

    sumTotalPriceWithoutDPH += totalPriceWithoutDPH;
    sumDPHFromTotalPrice += DPHFromTotalPrice;
    sumTotalPriceWithDPH += totalPrice;

    processItemRow(
      sheet,
      item,
      startRow + i,
      priceForUnitWithoutDPH,
      priceForUnitWithDPH,
      DPH,
      totalPriceWithoutDPH,
      DPHFromTotalPrice,
      totalPrice,
      sender.isDPHPayer
    );
  });

  processSummaryRow(
    sheet,
    startRow,
    items,
    sumTotalPriceWithDPH,
    sumTotalPriceWithoutDPH,
    sumDPHFromTotalPrice,
    sender.isDPHPayer
  );

  //Set Print area to A1 to K52 if only one page is needed
  if (items.length <= 26) {
    console.log("Less than 26 items, removing second page");
    sheet.pageSetup.printArea = "A1:K52";
  } else {
    console.log("More than 26 items, keeping second page");
    sheet.pageSetup.printArea = "A1:K108";
  }

  await workbook.xlsx.writeFile(tempPath);
}

async function getSenderById(senderId: number): Promise<Sender> {
  const personDataPath = getDataFilePath("PersonalData.json");

  if (!fs.existsSync(personDataPath)) {
    console.error("PersonalData.json not found at path:", personDataPath);
    return undefined;
  }

  const personData = JSON.parse(fs.readFileSync(personDataPath, "utf-8"));
  const sender = personData.find((p: Sender) => p.id === senderId) as
    | Sender
    | undefined;

  if (!sender) {
    console.error(`Sender with ID ${senderId} not found in PersonalData.json`);
    throw new Error(`Sender with ID ${senderId} not found`);
  }

  return sender;
}

export async function generateAndOpenExcel({
  items,
  senderId,
  car,
  company,
}: {
  items: IceCream[];
  senderId: number;
  car: Car;
  company: Company;
}): Promise<{ success: boolean; error?: string }> {
  const sender = await getSenderById(senderId);

  const tempPath = path.join(os.tmpdir(), `preview-${Date.now()}.xlsx`);

  const templatePath = getDataFilePath("Template.xlsx");

  if (!fs.existsSync(templatePath)) {
    dialog.showMessageBox({
      type: "error",
      title: "Chyba",
      message: "Súbor šablóny (Template.xlsx) nebol nájdený.",
      detail: `Skontrolujte, či sa súbor nachádza na očakávanej ceste:\n${templatePath}`,
    });

    return { success: false, error: "Template file not found" };
  }

  await processExcel({
    items,
    sender,
    car,
    company,
    templatePath,
    tempPath,
    asInvoice: false,
  });

  if (isDev) {
    // v dev režime otvori excel normálne
    await shell.openPath(tempPath);
  } else {
    // v produkcii otvori v Print Preview pomocou PowerShell COM
    const psScript = [
      `$excel  = New-Object -ComObject Excel.Application`,
      `$wb     = $excel.Workbooks.Open('${tempPath.replace(/\\/g, "\\\\")}')`,
      `$excel.Visible = $true`,
      `$wb.ActiveSheet.PrintPreview($true)`,
    ].join("; ");

    spawn(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", psScript],
      { shell: true }
    );
  }

  return { success: true };
}

export async function generateAndOpenExcelInvoice({
  items,
  senderId,
  car,
  company,
}: {
  items: IceCream[];
  senderId: number;
  car: Car;
  company: Company;
}): Promise<{ success: boolean; error?: string }> {
  const sender = await getSenderById(senderId);
  const templatePath = getDataFilePath("Template.xlsx");
  const tempPath = path.join(os.tmpdir(), `preview-${Date.now()}.xlsx`);

  if (!fs.existsSync(templatePath)) {
    dialog.showMessageBox({
      type: "error",
      title: "Chyba",
      message: "Súbor šablóny (Template.xlsx) nebol nájdený.",
      detail: `Skontrolujte, či sa súbor nachádza na očakávanej ceste:\n${templatePath}`,
    });

    return { success: false, error: "Template file not found" };
  }

  await processExcel({
    items,
    sender,
    car,
    company,
    templatePath,
    tempPath,
    asInvoice: true,
  });

  const xlsxEscaped = tempPath.replace(/\\/g, "\\\\");

  const ps = [
    `$excel = New-Object -ComObject Excel.Application`,
    `$excel.Visible = $false`,
    `$wb = $excel.Workbooks.Open('${xlsxEscaped}')`,
    `$wb.PrintOut()`,
    `$wb.Close($false)`,
    `$excel.Quit()`,
  ].join("; ");

  spawn(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps],
    { shell: true }
  );

  return { success: true };
}

export async function exportToPDF({
  items,
  senderId,
  car,
  company,
}: {
  items: IceCream[];
  senderId: number;
  car: Car;
  company: Company;
}): Promise<{ success: boolean; error?: string } | { canceled: boolean }> {
  const sender = await getSenderById(senderId);
  const templatePath = getDataFilePath("Template.xlsx");
  const tempXlsx = path.join(os.tmpdir(), `export-${Date.now()}.xlsx`);

  await processExcel({
    items,
    sender,
    car,
    company,
    templatePath,
    tempPath: tempXlsx,
    asInvoice: false,
  });

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Uložiť objednávku ako PDF",
    defaultPath: "objednávka.pdf",
    filters: [{ name: "PDF súbory", extensions: ["pdf"] }],
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  const xlsxEscaped = tempXlsx.replace(/\\/g, "\\\\");
  const pdfEscaped = filePath.replace(/\\/g, "\\\\");
  const ps = [
    `$excel = New-Object -ComObject Excel.Application`,
    `$excel.Visible = $false`,
    `$wb = $excel.Workbooks.Open('${xlsxEscaped}')`,
    `$wb.ExportAsFixedFormat(0, '${pdfEscaped}')`,
    `$wb.Close($false)`,
    `$excel.Quit()`,
  ].join("; ");

  spawn(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps],
    { shell: true }
  );

  return { success: true };
}

// This function is used to print data directly from the application
// It generates an Excel file, and print it via active printer
export async function printData({
  items,
  senderId,
  car,
  company,
}: {
  items: IceCream[];
  senderId: number;
  car: Car;
  company: Company;
}): Promise<{ success: boolean; error?: string }> {
  console.log("Printing data");
  const sender = await getSenderById(senderId);
  const templatePath = getDataFilePath("Template.xlsx");
  const tempXlsx = path.join(os.tmpdir(), `export-${Date.now()}.xlsx`);

  if (!fs.existsSync(templatePath)) {
    dialog.showMessageBox({
      type: "error",
      title: "Chyba",
      message: "Súbor šablóny (Template.xlsx) nebol nájdený.",
      detail: `Skontrolujte, či sa súbor nachádza na očakávanej ceste:\n${templatePath}`,
    });

    return { success: false, error: "Template file not found" };
  }

  await processExcel({
    items,
    sender,
    car,
    company,
    templatePath,
    tempPath: tempXlsx,
    asInvoice: false,
  });

  const xlsxEscaped = tempXlsx.replace(/\\/g, "\\\\");
  const ps = [
    `$excel = New-Object -ComObject Excel.Application`,
    `$excel.Visible = $false`,
    `$wb = $excel.Workbooks.Open('${xlsxEscaped}')`,
    `$wb.PrintOut()`,
    `$wb.Close($false)`,
    `$excel.Quit()`,
  ].join("; ");

  spawn(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps],
    { shell: true }
  );

  return { success: true };
}

export async function updateSender(sender: Sender) {
  console.log("Updating sender details:", sender);

  //Cehck if sender yearOFLastID is current year, if not set it to current year and set lastID to 1
  const currentYear = new Date().getFullYear();
  if (sender.yearOFLastID !== currentYear) {
    sender.yearOFLastID = currentYear;
    sender.lastID = 1; // Reset lastID to 1 for new year
  }

  if (sender.invoiceYearOFLastID !== currentYear) {
    sender.invoiceYearOFLastID = currentYear;
    sender.invoiceLastID = 1; // Reset lastID to 1 for new year
  }

  //Update import personData from "../data/PersonalData.json"; with new sender data
  const personDataPath = getDataFilePath("PersonalData.json");
  if (!fs.existsSync(personDataPath)) {
    console.error("PersonalData.json not found at path:", personDataPath);
  } else {
    const personData = JSON.parse(fs.readFileSync(personDataPath, "utf-8"));
    const index = personData.findIndex(
      (p: Sender) => p.name === sender.name && p.lastname === sender.lastname
    );

    if (index !== -1) {
      personData[index] = { ...personData[index], ...sender };
      fs.writeFileSync(personDataPath, JSON.stringify(personData, null, 2));
      console.log("Sender details updated successfully.");
    } else {
      console.error("Sender not found in PersonalData.json");
    }
  }

  return;
}
