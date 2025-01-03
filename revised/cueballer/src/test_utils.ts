// utils.ts
import * as fs from 'fs';
import * as path from 'path';
import { promises as fsPromises } from 'fs'; // Import the promises API

export interface CueballerTestCase {
    name: string
    input: string
}

export function getTestCases(directoryPath: string) {
    return fs.readdirSync(directoryPath).map(f => {
        return { name: f, input: fs.readFileSync(directoryPath + "/" + f).toString() }
    })
}
