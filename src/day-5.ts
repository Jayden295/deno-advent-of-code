// SPDX-License-Identifier: GPL-3.0-or-later
import { isNumber, OpenFileLineByLineAsArray } from "./helper.ts";

function printUsage() {
  console.log("Usage: day-4.ts [filename]");
}

// Creates a hashmap that has
// key -> the number that is before
// value -> array that has numbers that need to be next
function parseRules(lines: Array<string>) {
  const rules: Map<number, Array<number>> = new Map();

  for (let i = 0; i < lines.length; i++) {
    const parsed_rule = ["", ""];
    let i_parsed_rule = 0;

    for (const char of lines[i]) {
      if (isNumber(char)) {
        parsed_rule[i_parsed_rule] = parsed_rule[i_parsed_rule].concat(char);
      } else if (char === "|") {
        if (i_parsed_rule === 0) {
          i_parsed_rule++;
        } else {
          throw new Error("Got more then one | in the currently parsed rule!");
        }
      }
    }

    // If both values exist
    if (parsed_rule[0] !== "" && parsed_rule[1] !== "") {
      const already_existing_rule = rules.get(parseInt(parsed_rule[0]));

      // If a rule already exists, append to it
      if (already_existing_rule instanceof Array) {
        already_existing_rule.push(parseInt(parsed_rule[1]));

        // Otherise create a new rule with the key being the first number
      } else {
        rules.set(parseInt(parsed_rule[0]), [parseInt(parsed_rule[1])]);
      }

      // If both values are empty (if it's a newline), return
    } else if (parsed_rule[0] === "" && parsed_rule[1] === "") {
      if (rules.size > 0) {
        // Returns the rules we with current index
        // So that the parsePageUpdates know where to start
        return { rules, i };
      }

      // One of the values is set while the other is empty, error out
    } else {
      throw new Error(
        "Parsed rule is invalid, I only have one parsed value here!",
      );
    }
  }

  // Return lines.length - 1 since it expects an index (starts at 0 for 1 item)
  // and not a length (starts at 1 for 1 item)
  const i = lines.length - 1;
  return { rules, i };
}

// Returns an array of lines (as an array) that contain numbers
// Essentially the same as the input but in a better way for the other functions
function parsePageUpdates(lines: Array<string>, i_line: number) {
  const page_updates: Array<Array<number>> = [];

  for (let i = i_line; i < lines.length; i++) {
    lines[i] = lines[i].trim();
    let parsed_number = "";
    const parsed_numbers = [];

    for (const char of lines[i]) {
      if (isNumber(char)) {
        parsed_number = parsed_number.concat(char);
      } else if (char === ",") {
        parsed_numbers.push(parseInt(parsed_number));
        parsed_number = "";
      } else {
        throw new Error(`Unexpected character (${char}) at line ${i + 1}`);
      }
    }

    parsed_numbers.push(parseInt(parsed_number));
    if (parsed_number.length > 0) {
      page_updates.push(parsed_numbers);
    }
  }

  return page_updates;
}

// Check if the updates provided are valid with the rules
// If those are valid add the middle page value to a variable
// And we output this variable
function partOne(
  updates: Array<Array<number>>,
  rules: Map<number, Array<number>>,
) {
  let middle_page_numbers = 0;

  for (const update of updates) {
    // Assume that it is valid by default
    let valid = true;

    for (let i = 0; i < update.length; i++) {
      const rule = rules.get(update[i]);

      // Get every value before the current number we are one
      const numbers_before = update.slice(0, i);

      // If we found a rule for that number (sometimes we don't and it's okay)
      if (rule !== undefined) {
        for (const number of rule) {
          // If the number is present before the current one then it's invalid
          // (rules says it needs to be after

          const number_found = numbers_before.indexOf(number);
          if (-1 < number_found) {
            valid = false;
          }
        }
      }
    }

    // If the update is valid then add the middle value
    if (valid === true) {
      const middle_index = Math.floor(update.length / 2);
      middle_page_numbers += update[middle_index];
    }
  }

  return middle_page_numbers;
}

const filename = Deno.args[0];
if (filename == null) {
  printUsage();
  Deno.exit(1);
}

const lines = await OpenFileLineByLineAsArray(filename);

const parse_rules_output = parseRules(lines);
const page_updates = parsePageUpdates(lines, parse_rules_output.i);
const middle_page_values = partOne(page_updates, parse_rules_output.rules);
console.log(`every valid middle page index added up: ${middle_page_values}`);
