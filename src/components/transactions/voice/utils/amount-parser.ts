import { z } from "zod";

const numberWords: Record<string, number> = {
  zero: 0, um: 1, dois: 2, três: 3, quatro: 4,
  cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9,
  dez: 10, onze: 11, doze: 12, treze: 13, quatorze: 14,
  quinze: 15, dezesseis: 16, dezessete: 17, dezoito: 18, dezenove: 19,
  vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50,
  sessenta: 60, setenta: 70, oitenta: 80, noventa: 90,
  cem: 100, cento: 100, duzentos: 200, trezentos: 300, quatrocentos: 400,
  quinhentos: 500, seiscentos: 600, setecentos: 700, oitocentos: 800,
  novecentos: 900, mil: 1000,
};

const amountSchema = z.number()
  .min(0.01, "O valor deve ser maior que zero")
  .max(1000000, "O valor deve ser menor que 1.000.000");

export function parseAmount(text: string): number | null {
  try {
    const normalized = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[rR]\$/, "")
      .replace(/reais?/, "")
      .replace(/centavos?/, "")
      .replace(/,/g, ".")
      .trim();

    const directNumber = parseFloat(normalized);
    if (!isNaN(directNumber)) {
      return amountSchema.parse(directNumber);
    }

    const words = normalized.split(/\s+/);
    let total = 0;
    let currentNumber = 0;
    let hasValidNumber = false;

    for (const word of words) {
      const value = numberWords[word];
      
      if (value !== undefined) {
        hasValidNumber = true;
        if (value === 1000) {
          currentNumber = currentNumber === 0 ? value : currentNumber * value;
          total += currentNumber;
          currentNumber = 0;
        } else if (value >= 100) {
          currentNumber = value;
        } else {
          currentNumber += value;
        }
      }
    }

    total += currentNumber;

    if (hasValidNumber) {
      return amountSchema.parse(total);
    }

    return null;
  } catch (error) {
    console.error("Error parsing amount:", error);
    return null;
  }
}