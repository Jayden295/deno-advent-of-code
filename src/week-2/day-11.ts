// SPDX-License-Identifier: GPL-3.0-or-later
import { OpenFileLineByLineAsArray } from "../helper.ts";

// This one was hard
// You might be wondering: HOW CAN IT BE SO FAST???
// Caching is the solution, im caching every output at each step and stone
// Without caching this would be VERY VERY SLOW at numbers >50

function printUsage() {
  console.log("Usage: day-10.ts [filename]");
}

// Parse the input, take the first non empty line
// Split everything with a space and convert it to a number
function parse(lines: string[]): number[] {
  let parsed: string[] = [];

  for (const line of lines) {
    const trimmed_line = line.trim();
    if (trimmed_line !== "") {
      if (0 < parsed.length) {
        throw new Error("Unexpected non empty line in disk map!");
      }

      parsed = trimmed_line.split(" ");
    }
  }

  const stones: number[] = parsed.map(Number);
  return stones;
}

function getFromCache(
  cache: Map<number, Map<number, number>>,
  steps: number,
  stone: number,
): number | undefined {
  const steps_output = cache.get(steps);
  if (steps_output === undefined) {
    return;
  }

  return steps_output.get(stone);
}

function addToCache(
  cache: Map<number, Map<number, number>>,
  steps: number,
  stone: number,
  output: number,
): undefined {
  let steps_output = cache.get(steps);
  if (steps_output === undefined) {
    cache.set(steps, new Map());
    steps_output = cache.get(steps);
  }

  if (steps_output !== undefined) {
    const output_for_stone = steps_output.get(stone);

    if (output_for_stone === undefined) {
      steps_output.set(stone, output);
    }
  } else {
    throw new Error(
      "steps_output for the cache is undefined even though it should be",
    );
  }
}

// Blinks for steps amount of times for one stone
// Returns the amount of stones after blinking
function blinkOneStone(
  stone: number,
  steps: number,
  cache: Map<number, Map<number, number>>,
): number {
  // If this is the last step return 1 stone
  if (steps === 0) {
    return 1;
  }

  // If stone is 0 then set it to 1
  if (stone === 0) {
    const cached = getFromCache(cache, steps, stone);
    if (cached !== undefined) {
      return cached;
    }

    const output = blinkOneStone(1, steps - 1, cache);
    addToCache(cache, steps, stone, output);
    return output;
  }

  // If the length of the number is even that divide it
  const as_string = stone.toString();
  if (as_string.length % 2 === 0) {
    const cached = getFromCache(cache, steps, stone);
    if (cached !== undefined) {
      return cached;
    }

    const divide_at = as_string.length / 2;

    const first_half = blinkOneStone(
      parseInt(as_string.slice(0, divide_at)),
      steps - 1,
      cache,
    );
    const second_half = blinkOneStone(
      parseInt(as_string.slice(divide_at, divide_at * 2)),
      steps - 1,
      cache,
    );

    const output = first_half + second_half;
    addToCache(cache, steps, stone, output);
    return output;
  }

  // None of the previous conditions are met, multiply by 2024
  const cached = getFromCache(cache, steps, stone);
  if (cached !== undefined) {
    return cached;
  }

  const output = blinkOneStone(stone * 2024, steps - 1, cache);
  addToCache(cache, steps, stone, output);
  return output;
}

// Blink on stones for steps amount of times
function blink(
  stones: number[],
  steps: number,
  cache: Map<number, Map<number, number>>,
): number {
  let stone_count: number = 0;
  for (const stone of stones) {
    stone_count += blinkOneStone(stone, steps, cache);
  }

  return stone_count;
}

async function main() {
  const filename = Deno.args[0];
  if (filename == null) {
    printUsage();
    Deno.exit(1);
  }

  const lines = await OpenFileLineByLineAsArray(filename);
  const stones = parse(lines);

  const output_cache: Map<number, Map<number, number>> = new Map();
  const part_one = blink(stones, 25, output_cache);
  const part_two = blink(stones, 75, output_cache);

  console.log(`number of stones after 25 blinks: ${part_one}`);
  console.log(`number of stones after 75 blinks: ${part_two}`);
}

main();
