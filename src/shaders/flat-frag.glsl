#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

void main() {
  vec4 col1 = vec4(1, .61, .32, 1);
  vec4 col2 = vec4(.43, .61, .739, 1);
  out_Col = mix(col1, col2, fs_Pos.y + .7);
  //out_Col = col2;
}
