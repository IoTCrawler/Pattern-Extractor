/// Fills missing data in samples (by repeating last known value)
export function fillMissingData(samples: (number | null)[][]): number[][] {
    const result = Array(samples.length).fill(Array<number>(samples[0].length));

    //TODO this does not work, output can be [[x, null], [x, null], ...]
    for (let sampleIndex = 0; sampleIndex < samples[0].length; sampleIndex++) {
        // fills samples[0:end][sampleIndex]
        let lastNull: number | null = null;
        for (let i = 0; i < result.length; i++) {
            if (samples[i][sampleIndex] === null && lastNull === null) {
                lastNull = i;
                continue;
            }
            
            result[i][sampleIndex] = samples[i][sampleIndex]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
            
            if (lastNull === null) {
                continue;
            }

            for (let j = i - 1; j >= lastNull; j--) {
                result[j][sampleIndex] = samples[i][sampleIndex]!;  // eslint-disable-line @typescript-eslint/no-non-null-assertion
            }

            lastNull = null;
        }

        if (lastNull !== null) {
            throw new MissingDataError(sampleIndex, `No samples available for sampleIndex=${sampleIndex}. Unable to fill data.`);
        }
    }

    return result;
}

export class MissingDataError extends Error {
    public readonly sampleIndex: number;

    constructor(sampleIndex: number, message: string) {
        super(message);
        this.sampleIndex = sampleIndex;
    }
}