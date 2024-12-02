// SPDX-License-Identifier: GPL-3.0-or-later
import { OpenFileLineByLine } from "./helper.ts";

function PrintUsage() {
  console.log("Usage: day-one.ts [filename]");
}

async function GetListsFromFile(filename: string) {
  const list_one: Array<number> = [];
  const list_two: Array<number> = [];

  const lines = await OpenFileLineByLine(filename);
  for await (const line of lines) {
    const parsed_number = parseInt(line);
    list_one.push(parsed_number);

    const line_without_first_number = line.replace(String(parsed_number), "");
    list_two.push(parseInt(line_without_first_number));
  }

  return { list_one, list_two };
}

function GetDistance(list_one: Array<number>, list_two: Array<number>) {
  list_one.sort(function (a, b) {
    return a - b;
  });

  list_two.sort(function (a, b) {
    return a - b;
  });

  let total_distance = 0;

  for (let i = 0; i < list_one.length; i++) {
    if (list_one[i] < list_two[i]) {
      total_distance += list_two[i] - list_one[i];
    } else {
      total_distance += list_one[i] - list_two[i];
    }
  }

  return total_distance;
}

function GetSimilarity(
  list_one: Array<number>,
  list_two: Array<number>,
) {
  list_one.sort(function (a, b) {
    return a - b;
  });

  list_two.sort(function (a, b) {
    return a - b;
  });

  let similarity = 0;

  for (let i = 0; i < list_one.length; i++) {
    let counter = 0;
    for (let l = 0; l < list_two.length; l++) {
      if (list_two[l] == list_one[i]) {
        counter++;
      }
    }

    similarity += list_one[i] * counter;
  }

  return similarity;
}

const filename = Deno.args[0];
if (filename == null) {
  PrintUsage();
  Deno.exit(1);
}

const lists = await GetListsFromFile(filename);
const distance = GetDistance(lists.list_one, lists.list_two);
const similarity = GetSimilarity(lists.list_one, lists.list_two);

if (Number.isNaN(distance) || Number.isNaN(similarity)) {
  console.log(
    "If distance or similarity is NaN, you might have put the wrong file as first argument!",
  );
}

console.log(`Distance: ${distance}`);
console.log(`Similarity: ${similarity}`);
