// SPDX-License-Identifier: GPL-3.0-or-later
import { OpenFileLineByLine } from "./helper.ts";

function printUsage() {
  console.log("Usage: day-4.ts [filename]");
}

// Looks for X-MAS
function look_for_x_mas(
  lines: Array<string>,
  x: number,
  y: number,
  x_shaped: string,
) {
  const up_left = look_around_in_direction(
    lines,
    x - 1,
    y - 1,
    1,
    1,
    x_shaped,
    0,
  );
  const up_right = look_around_in_direction(
    lines,
    x + 1,
    y - 1,
    -1,
    1,
    x_shaped,
    0,
  );
  const down_left = look_around_in_direction(
    lines,
    x - 1,
    y + 1,
    1,
    -1,
    x_shaped,
    0,
  );
  const down_right = look_around_in_direction(
    lines,
    x + 1,
    y + 1,
    -1,
    -1,
    x_shaped,
    0,
  );

  if (
    (up_left === true || down_right === true) &&
    (up_right === true || down_left === true)
  ) {
    return true;
  }

  return false;
}

// Look in a specific direction for a word to find
// i_of_char is where in the word do we start (usually 0)
function look_around_in_direction(
  lines: Array<string>,
  x: number,
  y: number,
  x_dir: number,
  y_dir: number,
  word_to_find: string,
  i_of_char: number,
) {
  // If we are going to access a location that doesn't exist
  // Return false
  if (y < 0) {
    return false;
  }
  if (lines.length - 1 < y) {
    return false;
  }

  if (x < 0) {
    return false;
  }
  if (lines[y].length - 1 < x) {
    return false;
  }

  // If we are on the right character
  if (lines[y][x] === word_to_find[i_of_char]) {
    // If we have looped over the whole word
    if (i_of_char === word_to_find.length - 1) {
      return true;
    } else {
      // Add to the direction then put it inside of the 
      // Next loop
      y += y_dir;
      x += x_dir;

      return look_around_in_direction(
        lines,
        x,
        y,
        x_dir,
        y_dir,
        word_to_find,
        i_of_char + 1,
      );
    }
  }

  // Return false since it's not =
  return false;
}

// Look around the char to see if we can find a word
// Returns how many times that word was found
function look_around(
  lines: Array<string>,
  x: number,
  y: number,
  word_to_find: string,
) {
  let count = 0;

  // Loop over previous, current and next line
  for (let i = Math.max(y - 1, 0); i < Math.min(y + 2, lines.length); i++) {

    // Loop over each character of the line
    for (
      let l = Math.max(x - 1, 0);
      l < Math.min(x + 2, lines[i].length);
      l++
    ) {
      if (
        look_around_in_direction(lines, x, y, l - x, i - y, word_to_find, 0) ===
          true
      ) {
        count++;
      }
    }
  }

  return count;
}

// Parse a whole file for XMAS and X-MAS
async function parse(filename: string, word_to_find: string, x_shaped: string) {
  let amount_of_xmas = 0;
  let amount_of_x_mas = 0;

  const opened_file = await OpenFileLineByLine(filename);
  const lines = [];

  for await (const line of opened_file) {
    lines.push(line);
  }

  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      // Check for XMAS (which starts with an X)
      if (lines[y][x] === word_to_find[0]) {
        amount_of_xmas += look_around(lines, x, y, word_to_find);
      }

      // Check for X-MAS (which the middle is A)
      if (lines[y][x] === x_shaped[Math.floor(x_shaped.length / 2)]) {
        if (look_for_x_mas(lines, x, y, x_shaped) === true) {
          amount_of_x_mas++;
        }
      }
    }
  }

  return { amount_of_xmas, amount_of_x_mas };
}

const filename = Deno.args[0];
if (filename == null) {
  printUsage();
  Deno.exit(1);
}

const word_to_find = "XMAS";
const x_shaped = "MAS";
const output = await parse(filename, word_to_find, x_shaped);

console.log(`amount of xmas: ${output.amount_of_xmas}`);
console.log(`amount of x_mas: ${output.amount_of_x_mas}`);
