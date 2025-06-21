// /functionlist
export interface Root {
  endpoint: string;
  status: number;
  data: string[] | FunctionData[];
  functions?: string[];
}

// /functions?name=example
export interface Table {
  field: string;
  type: string;
  description: string;
  required: string;
}

export interface FunctionData {
  function: string;
  description: string;
  usage: string;
  example: string;
  table: Table[];
  package: string;
  documentation: string;
  "source-code": string;
}

export const baseApiURL = "https://api.aoijs.org/api/v1/";

const apiEndpoints = {
  functions: `${baseApiURL}functions`,
  functionList: `${baseApiURL}functionlist`,
  function: (name: string) => `${baseApiURL}functions?name=${name}`,
  find: (name: string) => `${baseApiURL}find?name=${name}`,
};

export function apiRequest(endpoint: keyof typeof apiEndpoints, args?: string): Promise<Root> {
  return new Promise((resolve, reject) => {
    const endpointValue = apiEndpoints[endpoint];
    const url = typeof endpointValue === "function" ? endpointValue(args ?? "") : endpointValue;

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const response = await res.json();
        return response;
      })
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}
