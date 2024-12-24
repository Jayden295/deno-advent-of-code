import { OpenFileLineByLineAsArray } from "../helper.ts";

// Help needed: YES, I looked up online for potential AOC
// solutions and found out that you could use the bron
// kerbosch algorithm

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

// get an array of every single map item/whatev
// for each pair => create the connection they have
// we assume the biggest is that while in reality it isnt
// check first amount of pairs

function filter_computers(map_one: Computers, keys: string[]): Computers {
  const potential_keys = [...map_one.keys()];
  const common_keys = potential_keys.filter(
    (value) => keys.indexOf(value) >= 0,
  );

  const common: Computers = new Map();
  for (const key of common_keys) {
    common.set(key, map_one.get(key)!);
  }

  return common;
}

// Use the bron-kerbosch algorithmt to find the biggest connection
function bron_kerbosch(
  candidate: Computers,
  potential: Computers,
  exclude: Computers,
): string[] {
  if (potential.size <= 0 && exclude.size <= 0) {
    return [...candidate.keys()].sort();
  }

  let biggest: string[] = [];
  for (const vertex of potential) {
    const candidate_test = structuredClone(candidate);
    candidate_test.set(vertex[0], vertex[1]);

    const neighbours = [...vertex[1]];

    const vp: Computers = filter_computers(potential, neighbours);
    const ve: Computers = filter_computers(exclude, neighbours);

    const output = bron_kerbosch(candidate_test, vp, ve);
    if (output.length > biggest.length) biggest = output;

    potential.delete(vertex[0]);
    exclude.set(vertex[0], vertex[1]);
  }

  return biggest;
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

  const lan_party = bron_kerbosch(new Map(), computers.computers, new Map());
  const password = lan_party.join();
  console.log(`password to join lan party: ${password}`);
}

main();
