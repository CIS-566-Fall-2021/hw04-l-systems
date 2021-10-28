class ExpansionRule {
    mapping: Map<string, string> = new Map<string, string>(); 
    
    constructor() {

    }

    addRule(letter: string, expand: string) {
        this.mapping.set(letter, expand);
    }

    has(letter: string) {
        return this.mapping.has(letter);
    }
    get(letter: string) {
        return this.mapping.get(letter);
    }
}

export default ExpansionRule;