import { OpenFileLineByLineAsArray } from "../helper.ts";

type Previouses = Map<number, Map<number, Map<number, Map<number, number>>>>;

type Secret = {
  n: number;
  previouses: Previouses;
};

// Add the output number to the list of previouses
function add_previous(map: Previouses, previous: number[], secret: number) {
  if (previous.length !== 4) throw new Error("Previous array length not = 4");
  let first = map.get(previous[0]);
  if (first === undefined)
    first = map.set(previous[0], new Map()).get(previous[0]);
  if (first === undefined)
    throw new Error("first is undefined even though we have set it");

  let second = first.get(previous[1]);
  if (second === undefined)
    second = first.set(previous[1], new Map()).get(previous[1]);
  if (second === undefined)
    throw new Error("second is undefined even though we have set it");

  let third = second.get(previous[2]);
  if (third === undefined)
    third = second.set(previous[2], new Map()).get(previous[2]);
  if (third === undefined)
    throw new Error("third is undefined even though we have set it");

  let secrets = third.get(previous[3]);
  if (secrets === undefined)
    secrets = third.set(previous[3], secret).get(previous[3]);
  if (secrets === undefined)
    throw new Error("secrets is undefined even though we have set it");
}

// Get number that is before the previous
function get_previous(map: Previouses, previous: number[]): number | undefined {
  if (previous.length !== 4) throw new Error("Previous array length not = 4");
  const first = map.get(previous[0]);
  if (first === undefined) return;

  const second = first.get(previous[1]);
  if (second === undefined) return;

  const third = second.get(previous[2]);
  if (third === undefined) return;

  const secrets = third.get(previous[3]);
  if (secrets === undefined) return;

  return secrets;
}

function parseSecrets(lines: string[]): {
  secrets: Secret[];
  nine_previouses: number[][];
} {
  const secrets: Secret[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed_line = lines[i].trim();

    if (trimmed_line !== "") {
      secrets.push({
        n: parseInt(trimmed_line),
        previouses: new Map(),
      });
      if (isNaN(secrets[secrets.length - 1].n))
        throw new Error(
          `Unable to transform current line ${i + 1} into a number`,
        );
    }
  }

  return { secrets, nine_previouses: [] };
}

// Generate the 4 previous values at an index
function generate_previous(previouses: number[], start_i: number): number[] {
  const previous: number[] = [];
  for (let l = start_i; l < start_i + 4; l++) {
    previous.push(previouses[l] - previouses[l - 1]);
  }
  return previous;
}

// Add to the nine_previouses array while preventing duplicates
function add_nine_previouses(nine_previouses: number[][], previous: number[]) {
  if (previous.length !== 4) throw new Error("Previous array length not = 4");

  const previous_find = nine_previouses.find((prev) => {
    if (prev.length !== 4) throw new Error("Previous array length not = 4");
    for (let i = 0; i < prev.length; i++) {
      if (prev[i] !== previous[i]) return false;
    }

    return true;
  });

  if (previous_find === undefined) nine_previouses.push(previous);
}

// Evolve a number a specific amount of steps
// FIXME: Memoization is probably going to make this faster
function evolve(original: Secret, n: number, nine_previouses: number[][]) {
  let new_secret = original.n;

  const og_string = original.n.toString();
  const previouses: number[] = [
    parseInt(og_string.slice(og_string.length - 1)),
  ];

  for (let i = 0; i < n; i++) {
    new_secret = stepThree(stepTwo(stepOne(new_secret)));
    const as_string = new_secret.toString();
    const last_n: number = parseInt(as_string.slice(as_string.length - 1));
    previouses.push(last_n);

    if (previouses.length >= 5) {
      const previous: number[] = generate_previous(
        previouses,
        previouses.length - 4,
      );

      if (last_n === 9) add_nine_previouses(nine_previouses, previous);
      add_previous(original.previouses, previous, last_n);
    }
  }

  return new_secret;
}

function stepOne(secret_number: number) {
  let new_secret: number = secret_number * 64;
  new_secret = mix(new_secret, secret_number);
  return prune(new_secret);
}

function stepTwo(secret_number: number) {
  let new_secret = Math.floor(secret_number / 32);
  new_secret = mix(new_secret, secret_number);
  return prune(new_secret);
}

function stepThree(secret_number: number) {
  let new_secret: number = secret_number * 2048;
  new_secret = mix(new_secret, secret_number);
  return prune(new_secret);
}

function mix(value: number, secret_number: number) {
  return (value ^ secret_number) >>> 0;
}

function prune(secret_number: number) {
  return secret_number % 16777216;
}

// Solve part one by looping over secrets and making them "evolve"
function partOne(
  secrets: { secrets: Secret[]; nine_previouses: number[][] },
  evolve_amount: number,
): number {
  let sum: number = 0;

  for (const secret of secrets.secrets) {
    sum += evolve(secret, evolve_amount, secrets.nine_previouses);
  }

  return sum;
}

// Part two count most bananas obtainable
function partTwo(secrets: {
  secrets: Secret[];
  nine_previouses: number[][];
}): number {
  let most: number = -1;

  // For each previous
  for (let i = 0; i < secrets.nine_previouses.length; i++) {
    let most_bananas: number = 0;

    // For each secrets
    for (let l = 0; l < secrets.secrets.length; l++) {
      const price = get_previous(
        secrets.secrets[l].previouses,
        secrets.nine_previouses[i],
      );
      if (price !== undefined) most_bananas += price;
    }

    if (most_bananas > most) most = most_bananas;

    // TODO: Would be better to use the official Deno things
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(
      new TextEncoder().encode(`${i}/${secrets.nine_previouses.length - 1}`),
    );
  }

  console.log();
  return most;
}

async function main() {
  const filename = Deno.args[0];
  if (filename === undefined) {
    console.log("Usage: day-22.ts [filename]");
    throw new Error("Expected filename as first argument");
  }

  const lines = await OpenFileLineByLineAsArray(filename);
  const secrets = parseSecrets(lines);

  const sum = partOne(secrets, 2000);
  console.log(`sum of 2000th secret number generated by each buyer: ${sum}`);

  const most_bananas = partTwo(secrets);
  console.log(`most bananas obtainable: ${most_bananas}`);
}

main();
