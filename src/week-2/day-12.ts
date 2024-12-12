import { Location, OpenFileLineByLineAsArray } from "../helper.ts";

interface mapItem {
  char: string;
  location_visited: boolean;
}

interface plotSize {
  area: number;
  perimeter: number;
}

function printUsage() {
  console.log("Usage: day-10.ts [filename]");
}

// Parse lines
// Take each line of the file while removing whitespace
function parse(lines: string[]): mapItem[][] {
  const map: mapItem[][] = [];
  let finished: boolean = false;

  for (let i = 0; i < lines.length; i++) {
    const trimmed_line = lines[i].trim();

    if (trimmed_line !== "") {
      if (finished === false) {
        const converted_line: mapItem[] = [];
        for (const char of trimmed_line) {
          converted_line.push({ char, location_visited: false });
        }
        map.push(converted_line);
      } else {
        throw new Error(`Unexpected non empty line at line ${i + 1}`);
      }
    } // Say that we finished parsing the map once we get an empty line
    else if (0 < map.length) {
      finished = true;
    }
  }

  return map;
}

// Get total price for the current region
// Modifies map and says it's modified
function getRegionPrice(map: mapItem[][], current: Location): plotSize {
  const possible_movement: Location[] = [
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  const current_map_item: mapItem = map[current.y][current.x];

  // Start area at one since the current one we are on is one
  let area: number = 1;
  let perimeter: number = 0;

  current_map_item.location_visited = true;

  for (const movement of possible_movement) {
    const to_test: Location = {
      x: movement.x + current.x,
      y: movement.y + current.y,
    };

    // Check if index is within bounds
    if (
      0 <= to_test.y && to_test.y < map.length && 0 <= to_test.x &&
      to_test.x < map[to_test.y].length
    ) {
      const map_item_to_test: mapItem = map[to_test.y][to_test.x];

      if (
        current_map_item.char === map_item_to_test.char
      ) {
        if (
          map_item_to_test.location_visited === false
        ) {
          map_item_to_test.location_visited = true;

          const neighbour_price: plotSize = getRegionPrice(map, to_test);

          area += neighbour_price.area;
          perimeter += neighbour_price.perimeter;
        }
      } else {
        perimeter++;
      }
    } else {
      perimeter++;
    }
  }

  return { area, perimeter };
}

// Loop though every character to get total price
function getTotalPrice(map_pointer: mapItem[][]) {
  const map = structuredClone(map_pointer)
  let price: number = 0;

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x].location_visited === false) {
        const output: plotSize = getRegionPrice(map, { x, y });
        price += output.area * output.perimeter;
      }
    }
  }

  return price;
}

async function main() {
  const filename: string = Deno.args[0];
  if (filename === null) {
    printUsage();
    Deno.exit(1);
  }

  const lines: string[] = await OpenFileLineByLineAsArray(filename);
  const map: mapItem[][] = parse(lines);

  const total_price = getTotalPrice(map);
  console.log(`total price (part 1) : ${total_price}`);
}

main();
