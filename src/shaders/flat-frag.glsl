#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

void main() {
  vec4 blue = vec4(93.0/255.0, 211.0/255.0, 254.0/255.0, 1.0);
  vec4 darkBlue = vec4(0.0, 119.0/255.0, 163.0/255.0, 1.0);
  out_Col = vec4(0.5 * (fs_Pos + vec2(1.0)), 0.0, 1.0);
  out_Col = mix(darkBlue, blue, fs_Pos.y);
}
