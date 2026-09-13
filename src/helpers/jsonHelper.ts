export const stringifyJson = (json: any) => {
  try {
    const jsonString = JSON.stringify(json, null, 2);
    return jsonString;
  } catch (e) {
    console.error(e);
  }

  return "Parsing error";
};

export const openJsonInNewTab = (jsonInput: unknown): void => {
  const newTab = window.open("", "_blank");

  if (!newTab) {
    alert("Please allow pop-ups for this site.");
    return;
  }

  const pre = newTab.document.createElement("pre");

  pre.textContent = JSON.stringify(jsonInput, null, 2);

  newTab.document.body.style.margin = "0";
  newTab.document.body.style.padding = "24px";
  newTab.document.body.style.background = "#1e1e1e";
  newTab.document.body.style.color = "#d4d4d4";
  newTab.document.body.style.fontFamily = "monospace";

  newTab.document.body.appendChild(pre);
  newTab.document.title = "JSON Viewer";
};
