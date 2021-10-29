//expansion rule class

type PostConditions = {chance: number, condition: string};

class expansionRule {
    axiom: string;
    output: string;
    iterations: number;
    postConditionsArray: PostConditions[] = [];
    postConditionsArray2: PostConditions[] = [];
    postConditionsArray3: PostConditions[] = [];
    postConditionsArray4: PostConditions[] = [];
    p1: PostConditions = {chance: 1, condition: "F"};
    expansionMap: Map<string, PostConditions[]> = new Map<string, PostConditions[]>();

    constructor(ax: string, it: number){
        this.axiom = ax;
        this.iterations = it;
    }
    fillMap()
    {
        console.log('fill map');
        let p1: PostConditions = {chance: 1, condition: "F"};
        this.postConditionsArray.push(p1);
        ////
        //[-FX*FX]B+[&FX]"
        let p2: PostConditions = {chance: 1, condition: "//[+FFX]//[FX]//B//[-FFX]"}
        //let p21: PostConditions = {chance: 1, condition: "[CFX]F[CFX"}
        this.postConditionsArray2.push(p2);
       // this.postConditionsArray2.push(p21);
        let p3: PostConditions = {chance: .5, condition: "[&&FX][*F]"};
        let p31: PostConditions = {chance: 1.0, condition: "*[*FX]"};
        let p32: PostConditions = {chance: 1., condition: "*F"};
        let p33: PostConditions = {chance: 1, condition: "&"};
        this.postConditionsArray3.push(p3);
        this.postConditionsArray3.push(p31);
        this.postConditionsArray4.push(p32);
        this.postConditionsArray4.push(p33);
        this.expansionMap.set("F", this.postConditionsArray);
        this.expansionMap.set("X", this.postConditionsArray2);
        this.expansionMap.set("B", this.postConditionsArray3);
        this.expansionMap.set("C", this.postConditionsArray4);
        //this.expansionMap.set()
    }
    parseGrammar() : string
    {
        console.log("Parse");
        let newString = "";

    //iterate through map and map to itself
    for(let j= 0; j < this.iterations; j++){
       // let newString = "";
       for(let i = 0; i < this.axiom.length; i++){
        //let newString: string = "";
        console.log("Axiom");
        let curr = this.axiom[i];
        console.log(curr);
        let r = Math.random();
        console.log(r);
        let currList = this.expansionMap.get(curr);
        let s = "";
        if(currList)
        {
            let prev: number = -1;
            for(let j = 0; j < currList.length; j++)
            {
                if(r > prev &&  r < currList[j].chance)
                {
                    s = currList[j].condition;
                }
                prev = currList[j].chance
              
            }
           newString = newString + s;

           
        }
        else
        {
            newString = newString + curr;
        }
     


    }
    this.axiom = newString;
    newString = "";
}
        console.log(newString);
        this.output = this.axiom;
        return this.output;
    }
};
export default expansionRule;