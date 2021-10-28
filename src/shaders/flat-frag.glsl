#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

float noise (float x) {
  return sin (2. * x / .1) + sin(3.14159 * x / .1);
} 

vec3 paletteTemp(float t)
{
    vec3 a = vec3(0.338, -0.002, 0.608);
    vec3 b = vec3(0.308, 0.418, 0.858);
    vec3 c = vec3(0.448, 0.558, 0.608);
    vec3 d = vec3(-0.032, -0.032, 0.528);
    vec3 ret = a + b*cos( 6.28318*(c*t+d) );
    return ret;
}

void main() {
  out_Col = vec4(paletteTemp(((fs_Pos.y / 1.2 + 1.) / 2.) + .2 + (noise(fs_Pos.x) / 120.)), 1.);
}
