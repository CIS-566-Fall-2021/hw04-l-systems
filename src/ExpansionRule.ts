
export default class ExpansionRule
{
    inputLetter: string;
    
    numExpansions: number;
    // string is the expansion, number is its probability
    allExpansions: [string[], number][];

    constructor(inputLetterIn: string)
    {
        this.inputLetter = inputLetterIn;
        this.allExpansions = [];
        this.numExpansions = 0;
    }

    addExpansion(expansionIn: string[], probability: number): void
    {
        this.allExpansions.push([expansionIn, probability]);
        this.numExpansions++;
    }

    returnRandExpansion(randNumIn: number): string[]
    {
        let randVal: number = 0.0;
        let i: number = 0;

        while(randVal < 1.0 && i < this.numExpansions)
        {
            randVal += this.allExpansions[i][1]
            if(randNumIn < randVal)
            {
                return this.allExpansions[i][0];
            }
            i++;
        }

        return this.allExpansions[0][0];
    }
    
}

