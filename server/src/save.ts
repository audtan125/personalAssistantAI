import fs from 'fs';
import { getData } from './dataStore';

/**
 * Function that adds persistence to our data by storing the data in our program
 * into the dataFile.json file every time a put or post request is made
 *
 * @returns {} empty object - in all cases
 */
export function saveToFile(): Record<string, never> {
  // Record<string, never> is the type for an empty object

  const data = getData();
  // flag 'w' is to create file if doesn't exist or overwrite our existing data
  // running our entire program from parent folder so need to include src/
  fs.writeFileSync('src/dataFile.json', JSON.stringify(data), { flag: 'w' });
  return {};
}
