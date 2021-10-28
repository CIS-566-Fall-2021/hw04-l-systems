enum Seeder {
    SFC,
};

export default class Random {
    SEEDER: Seeder = Seeder.SFC;
    seedStr: string;
    seedGen: Function;
    a: number;
    b: number;
    c: number;
    d: number;

    constructor(seed: string) {
        this.seedStr = seed;
        switch(this.SEEDER) {
            case Seeder.SFC:
                this.seedGen = this.xmur3(this.seedStr);
                break;
            default:
                this.seedGen = this.xmur3(this.seedStr);
                break;
        }
    }

    rand(): Function {
        if (typeof this.a === 'undefined' ||
            this.a === null){
                this.a = this.seedGen();
        }
        if (typeof this.b === 'undefined' ||
            this.b === null){
                this.b = this.seedGen();
        }
        if (typeof this.c === 'undefined' ||
            this.c === null){
                this.c = this.seedGen();
        }
        if (typeof this.d === 'undefined' ||
            this.d === null){
                this.d = this.seedGen();
        }
        switch(this.SEEDER) {
            case Seeder.SFC:
                return this.sfc32(this.a, this.b, this.c, this.d);
                break;
            default:
                return this.sfc32(this.a, this.b, this.c, this.d);
                break;
        }
    }

    xmur3(str: string) {
        for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
            h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
            h = h << 13 | h >>> 19;
        return function() {
            h = Math.imul(h ^ h >>> 16, 2246822507);
            h = Math.imul(h ^ h >>> 13, 3266489909);
            return (h ^= h >>> 16) >>> 0;
        }
    }

    sfc32(a: number, b: number, c: number, d: number) {
        return function() {
            a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
            var t = (a + b) | 0;
            a = b ^ b >>> 9;
            b = c + (c << 3) | 0;
            c = (c << 21 | c >>> 11);
            d = d + 1 | 0;
            t = t + d | 0;
            c = c + t | 0;
            return (t >>> 0) / 4294967296;
        }
    }
}
