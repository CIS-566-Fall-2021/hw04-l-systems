#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

vec3 colorWheelForest(float angle) {
    vec3 a = vec3(0.5f, 0.5, 0.5f);
    vec3 b = vec3(0.f, 0.0, 0.1f);
    vec3 c = vec3(0.f, 0.f, 4.f);
    vec3 d = vec3(0, 0.0, 0.75);
    return a + b * cos(2.f * 3.14159 * (c * angle + d));
}

void main() {
  out_Col = vec4(colorWheelForest(sin(fs_Pos.x - 1.5f) + cos(fs_Pos.y) + u_Time / 200.f), 1.0);
}
