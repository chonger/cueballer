// utils.ts
import * as fs from 'fs';

export function getTestCases(directoryPath: string) {
    return fs.readdirSync(directoryPath).map(f => {
        return { name: f, input: fs.readFileSync(directoryPath + "/" + f).toString() }
    })
}
