
export var gl: WebGL2RenderingContext;
export function setGL(_gl: WebGL2RenderingContext) {
  gl = _gl;
}
export function readTextFile(file: string): string
{
    var text = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                text = allText;
            }
        }
    }
    rawFile.send(null);
    return text;
}
export function generateRandomNumber(min:number,max:number) {
    var highlightedNumber = Math.random() * (max - min) + min;

    return highlightedNumber;
};

export function getRandomInt(min:number, max:number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createGrid(){
    var array =[];
    for(var i = -5; i<= 5; i++){
        for(var j = -4; j<=5;j++){
            if(j==0||j==-1||j==-2) continue;//remove 0,0 because we have default tree there
            array.push([i,j]);
        }
    }
    return array;
}

export const file_string={
    leaf_obj:"./obj/leaf.obj",
    red_text:"./obj/red-maple-leaf.jpg",
    yellow_text:"./obj/orange.jpg",
    black_text:"./obj/dead.jpg",
    cyliner_obj:"./obj/cylinder.obj",
    tree_text:"./obj/tree.jpg",
    dark_text:"./obj/green.jpg",
}