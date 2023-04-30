const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const endpoint = "https://api.banana.dev/";
let directCallEndpoint = "http://localhost:8000/";
let isDirect = false;

async function runMain(apiKey, modelKey, modelInputs) {
  if (isDirect) {
    return runDirect(modelInputs);
  }

  const result = await startApi(apiKey, modelKey, modelInputs);
  if (result.finished) {
    return {
      id: result.id,
      message: result.message,
      created: result.created,
      apiVersion: result.apiVersion,
      modelOutputs: result.modelOutputs,
    };
  }

  while (true) {
    const dictOut = await checkApi(apiKey, result.callID);
    if (dictOut.message.toLowerCase() === "success") {
      return dictOut;
    }
  }
}

async function startMain(apiKey, modelKey, modelInputs) {
  const result = await startApi(apiKey, modelKey, modelInputs, true);
  return result.callID;
}

async function checkMain(apiKey, callID) {
  return checkApi(apiKey, callID);
}

async function runDirect(modelInputs) {
  const response = await fetch(directCallEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(modelInputs),
  });

  if (response.status !== 200) {
    throw new Error(
      `Server error: status code: ${
        response.status
      }\nContent: ${await response.text()}`
    );
  }

  const out = await response.json();

  return {
    id: uuidv4(),
    message: "",
    created: String(Math.floor(Date.now() / 1000)),
    apiVersion: "DIRECT",
    modelOutputs: [out],
  };
}

async function startApi(apiKey, modelKey, modelInputs, startOnly = false) {
  const routeStart = "start/v4/";
  const urlStart = `${endpoint}${routeStart}`;
  const payload = {
    id: uuidv4(),
    created: Math.floor(Date.now() / 1000),
    apiKey: apiKey,
    modelKey: modelKey,
    modelInputs: modelInputs,
    startOnly,
  };

  const response = await fetch(urlStart, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status !== 200) {
    throw new Error(`Server error: status code ${response.status}`);
  }

  const out = await response.json();
  if (out.message.toLowerCase().includes("error")) {
    throw new Error(out.message);
  }

  return out;
}

async function checkApi(apiKey, callID) {
  const routeCheck = "check/v4/";
  const urlCheck = `${endpoint}${routeCheck}`;

  const payload = {
    id: uuidv4(),
    created: Math.floor(Date.now() / 1000),
    longPoll: true,
    callID,
    apiKey,
  };

  const response = await fetch(urlCheck, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status !== 200) {
    throw new Error(`Server error: status code ${response.status}`);
  }

  const out = await response.json();
  if (out.message.toLowerCase().includes("error")) {
    throw new Error(out.message);
  }

  return out;
}
