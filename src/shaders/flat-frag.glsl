#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

const vec2 lightPos = vec2(-0.2, -0.25);
const vec4 lightCol = vec4(255.0, 87.0, 221.0, 255.0) / 255.0;

void main() {
  vec3 pinkCol = vec3(255.0 / 255.0, 181.0 / 255.0, 224.0 / 255.0);
  vec3 blueCol = vec3(181.0 / 255.0, 229.0 / 255.0, 255.0 / 255.0);
  float t = fs_Pos.y + 0.5/** fs_Pos.y*/;
  t = clamp(t, 0.0, 1.0);
  
  vec2 n_Dims = normalize(u_Dimensions);
  //out_Col = vec4(abs(fs_Pos * n_Dims), 1.0 ,1.0);
  vec4 sunsetOut = vec4(mix(pinkCol, blueCol, t), 1.0);

 /* vec2 pos = fs_Pos * n_Dims;
  //pos.y *= 0.85;
  vec2 lightDir = lightPos - pos;
  if (length(lightDir) < 0.07){
    out_Col = lightCol;
  }
  else if (length(lightDir) < (0.05*n_Dims.y)){
    out_Col = mix(lightCol, sunsetOut, (length(lightDir) - 0.1) / 0.02);
  }*/
  //else{
    out_Col = sunsetOut;
  //}
}
