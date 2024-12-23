import { OpenFileLineByLineAsArray } from "../helper.ts";

type Computers = Map<string, Set<string>>;

// Add the connection to a specific computer inside of the computers list
function addConnectionComputer(
  computers: Computers,
  key: string,
  value: string,
) {
  const computer = computers.get(key);
  if (computer === undefined) {
    computers.set(key, new Set([value]));
  } else {
    computer.add(value);
  }
}

// Create a list of computers and potential chiefs from a group of lines
function parseComputerConnections(lines: string[]): {
  computers: Computers;
  potential_chief: Set<string>;
} {
  const computers: Computers = new Map();
  const potential_chief: Set<string> = new Set();

  for (let i = 0; i < lines.length; i++) {
    const trimmed_line = lines[i].trim();

    if (trimmed_line !== "") {
      const connection = trimmed_line.split("-");
      if (connection.length !== 2)
        throw new Error(
          `Connection (${trimmed_line}) doesn't contain exactly two connections at line ${i + 1}`,
        );

      // Add to computer list
      addConnectionComputer(computers, connection[0], connection[1]);
      addConnectionComputer(computers, connection[1], connection[0]);

      // Add to potential chief
      connection
        .filter((str) => str[0] === "t")
        .forEach((str) => potential_chief.add(str));
    }
  }
  return { computers, potential_chief };
}

// Count amount of connections for a specific computer
function countConnections(computers: Computers, key: string): number {
  const get_computer = computers.get(key);
  if (get_computer === undefined)
    throw new Error(`Computer with key ${key} doesn't exist`);

  // Convert to array since it's more easy to handle
  const computer = [...get_computer];
  let valid_count = 0;

  for (let i = 0; i < computer.length - 1; i++) {
    for (let l = i + 1; l < computer.length; l++) {
      const nearby = computers.get(computer[i]);
      if (nearby === undefined)
        throw new Error(`Computer with key ${key} doesn't exist`);

      // Increase valid count by one if we can find the pair (which means they are connected)
      const valid_pair = [...nearby].indexOf(computer[l]) >= 0;
      if (valid_pair === true) valid_count++;

      // Delete from the specific computers to prevent duplicates
      const nearby_two = computers.get(computer[l]);
      if (nearby_two === undefined)
        throw new Error(`Computer with key ${key} doesn't exist`);

      nearby.delete(key);
      nearby_two.delete(key);
    }
  }

  return valid_count;
}

// Count amount of potential chief computers
function countPotentialComputers(
  computers_pointer: Computers,
  potential_chief: Set<string>,
): number {
  const computers = structuredClone(computers_pointer);
  let count = 0;

  potential_chief.forEach((potential) => {
    count += countConnections(computers, potential);
  });

  return count;
}

async function main() {
  const filename = Deno.args[0];
  if (filename === undefined) {
    console.log("Usage: day-23.ts [filename]");
    throw new Error("Expected filename as first argument");
  }

  const lines = await OpenFileLineByLineAsArray(filename);
  const computers = parseComputerConnections(lines);

  const count = countPotentialComputers(
    computers.computers,
    computers.potential_chief,
  );
  console.log(`count of potential chiefs: ${count}`);
}

main();
