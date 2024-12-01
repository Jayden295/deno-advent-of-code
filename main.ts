// now we need a way to get
import { TextLineStream } from "@std/streams";

async function thing() {
  const list_one: Array<number> = [];
  const list_two: Array<number> = [];

  const file = await Deno.open("./input", { read: true });
  const lines = file
    .readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  for await (const line of lines) {
    const parsed_number = parseInt(line);
    list_one.push(parsed_number);

    let line_without_first_number = line;
    line_without_first_number = line_without_first_number.replace(String(parsed_number), '');
    list_two.push(parseInt(line_without_first_number));
  }

  return { list_one, list_two };
}

// get two lists
function calculate_distance(list_one: Array<number>, list_two: Array<number>) {
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

  console.log(total_distance);
}

function calculate_similarity(list_one: Array<number>, list_two: Array<number>) {
  list_one.sort(function (a, b) {
    return a - b;
  });

  list_two.sort(function (a, b) {
    return a - b;
  });

  let similarity = 0;

  for (let i = 0; i < list_one.length; i++) {
    list_one[i]
    let counter = 0;
    for (let l = 0; l < list_two.length; l++) {
      if (list_two[l] == list_one[i]) {
        counter++;
      }
    }

    similarity += list_one[i] * counter;
  }

  console.log(similarity);
}

function main() {
  thing().then((lists) => {
    calculate_distance(lists.list_one, lists.list_two);
    calculate_similarity(lists.list_one, lists.list_two);
  });
}

main();