// SPDX-License-Identifier: GPL-3.0-or-later
import { isNumber, OpenFileLineByLineAsArray } from "../helper.ts";

// Represents a block in a disk
interface Block {
  empty: boolean;
  file_id: number;
}

// Represents a section of the disk
interface DiskSection {
  starting_index: number;
  size: number;
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
  const files: Array<DiskSection> = [];
  let gaps: Array<DiskSection> = [];

  let file_id = 0;
  let unhandled_free_space: Array<DiskSection> = [];

  for (let i = 0; i < disk_map.length; i++) {
    // If next file is not empty => we are going to create a gap so sav eit
    if (disk_map[i] !== "0") {
      gaps = gaps.concat(unhandled_free_space);
      unhandled_free_space = [];
    }

    // Add next file blocks

    // Store file location
    const file: DiskSection = {
      starting_index: disk.length,
      size: parseInt(disk_map[i]),
    };
    files.push(file);

    // Add it to the disk representation
    for (let l = 0; l < parseInt(disk_map[i]); l++) {
      const individual_block: Block = { empty: false, file_id: file_id };
      disk.push(individual_block);
    }

    file_id++;

    // Space blocks
    i++;

    // Store space location
    const space: DiskSection = {
      starting_index: disk.length,
      size: parseInt(disk_map[i]),
    };
    unhandled_free_space.push(space);

    // Add it to the disk representaiton
    for (let l = 0; l < parseInt(disk_map[i]); l++) {
      const individual_block: Block = { empty: true, file_id: -1 };
      disk.push(individual_block);
    }
  }

  return { disk, files, gaps };
}

// Remove gaps from a disk
// This literally causes fragmentation
function removeEveryGaps(
  disk_pointer: Block[],
  files: DiskSection[],
  gaps: DiskSection[],
) {
  // Copy to make sure we don't change the original values
  const disk = structuredClone(disk_pointer);
  const last_file = files[files.length - 1];
  let last_file_pointer = last_file.starting_index + last_file.size - 1;

  for (const gap of gaps) {
    for (let i = gap.starting_index; i < gap.starting_index + gap.size; i++) {
      if (last_file_pointer <= i) {
        break;
      }

      disk[i] = disk[last_file_pointer];
      disk[last_file_pointer] = { empty: true, file_id: -1 };

      do {
        last_file_pointer--;
      } while (disk[last_file_pointer].empty === true);
    }
  }

  return disk;
}

// Defrag disk
// We actually defragment the disk now
function defragDisk(
  disk_pointer: Block[],
  files: DiskSection[],
  gaps_pointer: DiskSection[],
) {
  const gaps = structuredClone(gaps_pointer);
  const disk = structuredClone(disk_pointer);

  for (let i = files.length - 1; 0 <= i; i--) {
    for (let l = 0; l < gaps.length; l++) {
      // Don't move the file to a gap after it, that would fragmen tit
      if (files[i].starting_index <= gaps[l].starting_index) {
        break;
      }

      if (files[i].size <= gaps[l].size) {
        // Move the file to the gap
        for (let m = 0; m < files[i].size; m++) {
          const file_pointer = files[i].starting_index + m;
          const gap_pointer = gaps[l].starting_index + m;

          disk[gap_pointer] = disk[file_pointer];
          disk[file_pointer] = { empty: true, file_id: -1 };
        }

        // Update the gap sizes
        gaps[l].starting_index += files[i].size;
        gaps[l].size -= files[i].size ;

        if (gaps[l].size <= 0) {
          gaps.splice(l, 1);
        } 
        break;
      }
    }
  }

  return disk;
}

// Calculate checksum of a disk
function calculateChecksum(disk: Block[]) {
  let filesystem_checksum = 0;

  for (let i = 0; i < disk.length; i++) {
    if (disk[i].empty === false) {
      filesystem_checksum += i * disk[i].file_id;
    }
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
  const files = create_disk_output.files;
  const gaps = create_disk_output.gaps;

  const no_gaps_disk = removeEveryGaps(disk, files, gaps);
  const defrag_disk = defragDisk(disk, files, gaps);

  const no_gaps_checksum = calculateChecksum(no_gaps_disk);
  const defrag_checksum = calculateChecksum(defrag_disk);

  console.log(`absolutely no gaps checksum: ${no_gaps_checksum}`);
  console.log(`defragged checksum: ${defrag_checksum}`);
}

main();
