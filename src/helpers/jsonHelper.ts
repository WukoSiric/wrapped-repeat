export const stringifyJson = (json: any) => {
  try {
    const jsonString = JSON.stringify(json, null, 2);
    return jsonString;
  } catch (e) {
    console.error(e);
  }

  return "Parsing error";
};
