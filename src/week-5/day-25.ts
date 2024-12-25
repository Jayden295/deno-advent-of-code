import { OpenFileLineByLineAsArray } from "../helper.ts";

// Help needed: Nope, not really, just had fun implementing
// the solution, to be honest, it was fairly easy, probably
// because we are the 25th and it's the final day.
//
// This year was very fun
// Not doing this using js/ts again tho...

enum TypeKeyLock {
  Key,
  Lock,
}

type KeyLock = {
  type: TypeKeyLock;
  heights: number[];
};

type Parsed = {
  keys: number[][];
  locks: number[][];
};

// Parse heights from a group of lines
function parseHeights(lines: string[]): number[] {
  const heights: number[] = [];
  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      if (line[i] === "#") {
        if (heights[i] !== undefined) heights[i]++;
        else heights[i] = 1;
      } else if (line[i] === ".") {
        if (heights[i] === undefined) heights[i] = 0;
      } else throw new Error("Unexpected character");
    }
  }

  return heights;
}

// Parse a group of lines that might be a key or lock
// Returns the height and the type (key or lock)
function parseKeyLock(lines: string[]): KeyLock {
  // Lock
  if (lines[0].length === lines[0].split("#").length - 1) {
    return {
      type: TypeKeyLock.Lock,
      heights: parseHeights(lines.slice(1, lines.length)),
    };
  }
  // Key
  else if (
    lines[lines.length - 1].length ===
    lines[lines.length - 1].split("#").length - 1
  ) {
    return {
      type: TypeKeyLock.Key,
      heights: parseHeights(lines.slice(0, lines.length - 1)),
    };
  } else throw new Error("Unable to guess if current object is a lock or kay");
}

// Loop though every line and return a list of keys and locks found
function parseLines(lines: string[]): Parsed {
  const keys: number[][] = [];
  const locks: number[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed_line = lines[i].trim();
    if (trimmed_line !== "") {
      const parsed = parseKeyLock(
        lines.splice(i, 7).map((line) => line.trim()),
      );
      if (parsed.type === TypeKeyLock.Key) keys.push(parsed.heights);
      else if (parsed.type === TypeKeyLock.Lock) locks.push(parsed.heights);
    }
  }

  return { keys, locks };
}

// Loop though every key and lock (to create a pair)
// And find it both fits
function countFit(parsed: Parsed): number {
  let fit_count = 0;

  for (const key of parsed.keys) {
    for (const lock of parsed.locks) {
      let valid_combination: boolean = true;

      if (lock.length !== key.length)
        throw new Error("Lock length not the same as key length");

      // Simply check if both of them added dont exceed five then it fits
      for (let i = 0; i < key.length; i++) {
        if (lock[i] + key[i] > 5) valid_combination = false;
      }

      if (valid_combination === true) fit_count++;
    }
  }

  return fit_count;
}

async function main() {
  const filename = Deno.args[0];
  if (filename === undefined) {
    console.log("Usage: day-25.ts [filename]");
    throw new Error("Expected filename as first argument");
  }

  const lines = await OpenFileLineByLineAsArray(filename);
  const parsed: Parsed = parseLines(lines);
  const fit_count = countFit(parsed);

  console.log(`amount of keys that fit: ${fit_count}`);
}

main();
