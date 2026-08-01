import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const child = spawn(
  "C:\\Users\\sup\\.local\\bin\\serena.exe",
  [
    "start-mcp-server",
    "--context=codex",
    "--language-backend",
    "JetBrains",
  ],
  {
    cwd: "D:\\GitHub\\support",
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
  },
);

const pending = new Map();
let nextId = 1;
let stderr = "";

createInterface({ input: child.stdout }).on("line", (line) => {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    return;
  }
  if (message.id !== undefined && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) {
      reject(new Error(JSON.stringify(message.error)));
    } else {
      resolve(message.result);
    }
  }
});

child.stderr.on("data", (chunk) => {
  stderr += chunk.toString();
});

function send(message) {
  child.stdin.write(`${JSON.stringify(message)}\n`);
}

function request(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Timed out waiting for ${method}`));
    }, 60_000);
    pending.set(id, {
      resolve: (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      reject: (error) => {
        clearTimeout(timer);
        reject(error);
      },
    });
    send({ jsonrpc: "2.0", id, method, params });
  });
}

async function run() {
  const initialized = await request("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "codex-serena-smoke", version: "1.0.0" },
  });
  send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });

  const listed = await request("tools/list");
  const names = listed.tools.map((tool) => tool.name);
  const jetBrainsNames = names.filter((name) => name.startsWith("jet_brains_"));

  await request("tools/call", {
    name: "activate_project",
    arguments: { project: "D:\\GitHub\\support" },
  });
  const config = await request("tools/call", {
    name: "get_current_config",
    arguments: {},
  });
  const symbols = await request("tools/call", {
    name: "jet_brains_get_symbols_overview",
    arguments: {
      relative_path:
        "apps/web/src/modules/repositories/repository-access/server-api.ts",
      depth: 1,
      max_answer_chars: 20_000,
    },
  });

  const configText = JSON.stringify(config);
  const symbolText = JSON.stringify(symbols);
  process.stdout.write(
    `${JSON.stringify(
      {
        protocolVersion: initialized.protocolVersion,
        serverName: initialized.serverInfo?.name,
        toolCount: names.length,
        jetBrainsToolCount: jetBrainsNames.length,
        jetBrainsTools: jetBrainsNames,
        hasJetBrainsDebug: names.includes("jet_brains_debug"),
        configMentionsJetBrains: configText.includes("JetBrains"),
        symbolCallSucceeded:
          !symbolText.includes('"isError":true') && symbolText.length > 20,
      },
      null,
      2,
    )}\n`,
  );
}

try {
  await run();
} catch (error) {
  process.stderr.write(
    `SMOKE_ERROR=${error instanceof Error ? error.message : String(error)}\n`,
  );
  if (stderr) {
    process.stderr.write(
      `SERENA_STDERR_TAIL=${stderr.slice(-2_000).replaceAll(/\s+/g, " ")}\n`,
    );
  }
  process.exitCode = 1;
} finally {
  child.kill();
}
