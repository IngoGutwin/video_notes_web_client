import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import UAParser from "ua-parser-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// todo: check user-agent from client
export function checkDevice(userAgent: any) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
}

export async function getStrapiData(path: string, query: any) {
  const baseUrl = import.meta.env.STRAPI_API;
  const url = new URL(path, baseUrl);
  url.search = query;
  try {
    const response = await fetch(url.href);
    const result = await response.json();
    const flattenData = flattenAttributes(result);
    return flattenData;
  } catch (error) {
    console.error(error);
  }
}

function flattenAttributes(data: any): any {
  // Check if data is a plain object; return as is if not
  if (
    typeof data !== "object" ||
    data === null ||
    data instanceof Date ||
    typeof data === "function"
  ) {
    return data;
  }

  // If data is an array, apply flattenAttributes to each element and return as array
  if (Array.isArray(data)) {
    return data.map((item) => flattenAttributes(item));
  }

  // Initialize an object with an index signature for the flattened structure
  let flattened: { [key: string]: any } = {};

  // Iterate over each key in the object
  for (let key in data) {
    // Skip inherited properties from the prototype chain
    if (!data.hasOwnProperty(key)) continue;

    // If the key is 'attributes' or 'data', and its value is an object, merge their contents
    if (
      (key === "attributes" || key === "data") &&
      typeof data[key] === "object" &&
      !Array.isArray(data[key])
    ) {
      Object.assign(flattened, flattenAttributes(data[key]));
    } else {
      // For other keys, copy the value, applying flattenAttributes if it's an object
      flattened[key] = flattenAttributes(data[key]);
    }
  }

  return flattened;
}
