import { OpenFileLineByLineAsArray } from "../helper.ts";

enum ParsingStatus {
  Nothing,
  Variables,
  FinishedVariables,
  Gates,
  FinishedGates,
}

enum Gate {
  AND,
  OR,
  XOR,
}

type Connection = {
  one: string;
  two: string;
  operation: Gate;
  out: string;
};

type Device = {
  variables: Map<string, boolean>;
  connections: Connection[];
};

function parseVariable(line: string): { name: string; value: boolean } {
  const parsed = line.split(": ");
  if (parsed.length !== 2)
    throw new Error(`Unable to parse initial wire value`);

  switch (parsed[1]) {
    case "1":
      return { name: parsed[0], value: true };
    case "0":
      return { name: parsed[0], value: false };
    default:
      throw new Error(`Initial wire value (${parsed[1]}) is not 1 or 0`);
  }
}

function parseGate(line: string): Connection {
  const parsed = line.split(" ");
  if (parsed.length !== 5) throw new Error(`Unable to parse connection`);

  switch (parsed[1]) {
    case "AND":
      return {
        one: parsed[0],
        two: parsed[2],
        operation: Gate.AND,
        out: parsed[4],
      };
    case "OR":
      return {
        one: parsed[0],
        two: parsed[2],
        operation: Gate.OR,
        out: parsed[4],
      };
    case "XOR":
      return {
        one: parsed[0],
        two: parsed[2],
        operation: Gate.XOR,
        out: parsed[4],
      };
    default:
      throw new Error("Unknown operation ");
  }
}

function parseDevice(lines: string[]): Device {
  let parsing_status: ParsingStatus = ParsingStatus.Nothing;
  const variables: Map<string, boolean> = new Map();
  const valid_keys: string[] = [];

  const connections: Connection[] = [];
  const unsorted_connections: Connection[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed_line = lines[i];

    if (trimmed_line !== "") {
      if (
        parsing_status === ParsingStatus.Nothing ||
        parsing_status === ParsingStatus.Variables
      ) {
        // Parse variables
        parsing_status = ParsingStatus.Variables;
        const variable = parseVariable(trimmed_line);
        variables.set(variable.name, variable.value);
      } else if (
        parsing_status === ParsingStatus.FinishedVariables ||
        parsing_status === ParsingStatus.Gates
      ) {
        // Parse gates
        parsing_status = ParsingStatus.Gates;

        const gate = parseGate(trimmed_line);
        if (
          valid_keys.indexOf(gate.one) >= 0 &&
          valid_keys.indexOf(gate.two) >= 0
        ) {
          connections.push(gate);
          valid_keys.push(gate.out);
        } else {
          unsorted_connections.push(gate);
        }
      } else {
        throw new Error(`Unexepected non empty line at line ${i + 1}`);
      }
    } else if (parsing_status === ParsingStatus.Variables) {
      parsing_status = ParsingStatus.FinishedVariables;
      valid_keys.push(...variables.keys());
    } else if (parsing_status === ParsingStatus.Gates) {
      parsing_status = ParsingStatus.FinishedGates;
    }
  }

  // FIXME: Prevent infinite loop if set up improperly
  while (unsorted_connections.length > 0) {
    const connection = unsorted_connections.shift()!;

    if (
      valid_keys.indexOf(connection.one) >= 0 &&
      valid_keys.indexOf(connection.two) >= 0
    ) {
      connections.push(connection);
      valid_keys.push(connection.out);
    } else {
      unsorted_connections.push(connection);
    }
  }

  return { variables, connections };
}

function execute(device: Device): number {
  // Execute program and update variables
  for (const connection of device.connections) {
    const one = device.variables.get(connection.one);
    if (one === undefined)
      throw new Error(
        `connection.one (${connection.one}) doesn't exist in variables`,
      );

    const two = device.variables.get(connection.two);
    if (two === undefined)
      throw new Error(
        `connection.two (${connection.two}) doesn't exist in variables`,
      );

    switch (connection.operation) {
      case Gate.AND:
        if (one === true && two === true) {
          device.variables.set(connection.out, true);
        } else {
          device.variables.set(connection.out, false);
        }
        break;
      case Gate.OR:
        if (one === true || two === true) {
          device.variables.set(connection.out, true);
        } else {
          device.variables.set(connection.out, false);
        }
        break;
      case Gate.XOR:
        if (one !== two) {
          device.variables.set(connection.out, true);
        } else {
          device.variables.set(connection.out, false);
        }
        break;
      default:
        throw new Error("Unknown gate");
    }
  }

  // Get the output
  const outputs = [...device.variables.keys()]
    .filter((key) => key.startsWith("z"))
    .sort()
    .reverse();

  let binary = "";
  for (const out of outputs) {
    const value = device.variables.get(out);
    if (value === undefined)
      throw new Error(`out (${out}) doesn't exist in variables`);

    if (value === true) binary = binary.concat("1");
    else binary = binary.concat("0");
  }

  return parseInt(binary, 2);
}

async function main() {
  const filename = Deno.args[0];
  if (filename === undefined) {
    console.log("Usage: day-24.ts [filename]");
    throw new Error("Expected filename as first argument");
  }

  const lines = await OpenFileLineByLineAsArray(filename);
  const device: Device = parseDevice(lines);

  const output = execute(device);
  console.log(`decimal output of z wires: ${output}`);
}

main();
