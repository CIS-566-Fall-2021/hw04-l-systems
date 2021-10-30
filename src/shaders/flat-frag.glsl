#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

float random1(vec2 p) {
  return fract(sin(dot(p, vec2(456.789, 20487145.123))) * 842478.5453);
}

float random1( vec3 p ) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 191.999))) * 43758.5453);
}

float mySmootherStep(float a, float b, float t) {
  t = t*t*t*(t*(t*6.0 - 15.0) + 10.0);
  return mix(a, b, t);
}

float interpNoise3D1(vec3 p) {
  vec3 pFract = fract(p);
  float llb = random1(floor(p));
  float lrb = random1(floor(p) + vec3(1.0,0.0,0.0));
  float ulb = random1(floor(p) + vec3(0.0,1.0,0.0));
  float urb = random1(floor(p) + vec3(1.0,1.0,0.0));

  float llf = random1(floor(p) + vec3(0.0,0.0,1.0));
  float lrf = random1(floor(p) + vec3(1.0,0.0,1.0));
  float ulf = random1(floor(p) + vec3(0.0,1.0,1.0));
  float urf = random1(floor(p) + vec3(1.0,1.0,1.0));

  float lerpXLB = mySmootherStep(llb, lrb, pFract.x);
  float lerpXHB = mySmootherStep(ulb, urb, pFract.x);
  float lerpXLF = mySmootherStep(llf, lrf, pFract.x);
  float lerpXHF = mySmootherStep(ulf, urf, pFract.x);

  float lerpYB = mySmootherStep(lerpXLB, lerpXHB, pFract.y);
  float lerpYF = mySmootherStep(lerpXLF, lerpXHF, pFract.y);

  return mySmootherStep(lerpYB, lerpYF, pFract.z);
}

float fbm(vec3 p, float octaves) {
  float amp = 0.5;
  float freq = 18.0;
  float sum = 0.0;
  float maxSum = 0.0;
  for(float i = 0.0; i < 10.0; ++i) {
    if(i == octaves)
    break;
    maxSum += amp;
    sum += interpNoise3D1(p * freq) * amp;
    amp *= 0.5;
    freq *= 2.0;
  }
  return sum / maxSum;
}

vec3 skyColor(vec3 dir) {
    float t = smoothstep(0.0, 1.0, dir.y);
    t = clamp(0.0, 1.0, t + fbm(dir / 8.0, 4.0) * 0.1);
    t = fbm(dir / 8.0 + (0.00005*u_Time), 6.0);
    t = smoothstep(0.0, 1.0, t);
    vec3 start = mix(vec3(236.0, 104.0, 22.0) / 255.0, vec3(250.0, 169.0, 67.0) / 255.0, t);
    return start;
}

void main() {
  out_Col = vec4(skyColor(vec3(fs_Pos, 1.)), 1.);
}
