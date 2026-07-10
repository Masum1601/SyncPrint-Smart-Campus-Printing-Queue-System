export const printPrinters = [
  "SSH",
  "AEH",
  "LSH",
  "FHH",
  "KAH",
  "MARH",
  "RKH",
] as const;

export type PrintPrinterCode = (typeof printPrinters)[number];

export function isPrintPrinterCode(value: string): value is PrintPrinterCode {
  return printPrinters.includes(value as PrintPrinterCode);
}