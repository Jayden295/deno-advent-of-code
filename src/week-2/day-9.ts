import { isNumber, OpenFileLineByLineAsArray } from "../helper.ts";

// Represents a block in a disk
interface Block {
  empty: boolean;
  file_id: number;
}

function printUsage() {
  console.log("Usage: day-9.ts [filename]");
}

// Parse the input, just takes the first string that is not empty
// And considers any other string as an error
// Doesn't do much
async function parse(filename: string): Promise<string> {
  const lines = await OpenFileLineByLineAsArray(filename);
  let disk_map = "";

  for (const line of lines) {
    const trimmed_line = line.trim();
    if (trimmed_line !== "") {
      if (disk_map !== "") {
        throw new Error("Unexpected non empty line in disk map!");
      }

      if (isNumber(trimmed_line) === false) {
        throw new Error("Disk map contains non numerical characters!");
      }

      disk_map = trimmed_line;
    }
  }

  return disk_map;
}

// Create disk from disk map
// 123 -> 1..222
// Returns a disk, an array of gaps indexes and the last file index
function createDisk(disk_map: string) {
  const disk: Array<Block> = [];
  let gaps: Array<number> = [];
  let last_file_pointer = -1;

  let file_id = 0;
  let unhandled_free_space: Array<number> = [];

  for (let i = 0; i < disk_map.length; i++) {
    // If next file is not empty => we are going to create a gap so sav eit
    if (disk_map[i] !== "0") {
      gaps = gaps.concat(unhandled_free_space);
      unhandled_free_space = [];
    }

    // Add next file blocks
    for (let l = 0; l < parseInt(disk_map[i]); l++) {
      const individual_block: Block = { empty: false, file_id: file_id };
      disk.push(individual_block);
    }

    last_file_pointer = disk.length - 1;
    file_id++;

    i++;

    // Add free space blocks
    for (let l = disk.length; l < disk.length + parseInt(disk_map[i]); l++) {
      unhandled_free_space.push(l);
    }

    for (let l = 0; l < parseInt(disk_map[i]); l++) {
      const individual_block: Block = { empty: true, file_id: -1 };
      disk.push(individual_block);
    }
  }

  return { disk, gaps, last_file_pointer };
}

// Remove gaps from a disk
// This literally causes fragmentation
function removeGaps(
  disk_pointer: Block[],
  gaps: number[],
  last_file_pointer_pointer: number,
) {
  // Copy to make sure we don't change the original values
  const disk = structuredClone(disk_pointer);
  let last_file_pointer = structuredClone(last_file_pointer_pointer);

  for (const gap of gaps) {
    if (last_file_pointer <= gap) {
      break;
    }

    disk[gap] = disk[last_file_pointer];
    disk[last_file_pointer] = { empty: true, file_id: -1 };

    do {
      last_file_pointer--;
    } while (disk[last_file_pointer].empty === true);
  }

  return disk;
}

// Calculate checksum of a disk
function calculateChecksum(disk: Block[]) {
  let filesystem_checksum = 0;

  for (let i = 0; i < disk.length; i++) {
    if (disk[i].empty === true) {
      break;
    }

    filesystem_checksum += i * disk[i].file_id;
  }

  return filesystem_checksum;
}

async function main() {
  const filename = Deno.args[0];
  if (filename == null) {
    printUsage();
    Deno.exit(1);
  }

  const disk_map = await parse(filename);
  const create_disk_output = createDisk(disk_map);

  const disk = create_disk_output.disk;
  const gaps = create_disk_output.gaps;
  const last_file_pointer = create_disk_output.last_file_pointer;

  const new_disk = removeGaps(disk, gaps, last_file_pointer);

  const new_checksum = calculateChecksum(new_disk);
  console.log(new_checksum);
}

main();
