#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 random(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

// Refer to a simple noise function online
float noise(vec3 pos){
    vec3 i = floor(pos);
    vec3 f = fract(pos);
    f = f * f * (3.0 - 2.0 * f);

    vec4 a = i.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = random(a.xyxy);
    vec4 k2 = random(k1.xyxy + a.zzww);
    vec4 b = k2 + i.zzzz;
    vec4 k3 = random(b);
    vec4 k4 = random(b + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));
    vec4 o3 = o2 * f.z + o1 * (1.0 - f.z);
    vec2 o4 = o3.yw * f.x + o3.xz * (1.0 - f.x);

    return o4.y * f.y + o4.x * (1.0 - f.y);
}

float fbm(vec3 pos) {
	float noiseOutput = 0.0;
	float amplitude = 0.5;
	for (int i = 0; i < 6; i++) {
		noiseOutput += amplitude * noise(pos);
		pos = 2.0 * pos + vec3(100);
		amplitude *= 0.5;
	}
	return noiseOutput;
}

void main() {
    vec3 colorBack = vec3(0.5, 0.5, 0.5);
    vec3 colorFront = vec3(0.5294, 0.8078, 0.9216);

    float noiseOutput = fbm(vec3(fs_Pos, 1.));

    out_Col = vec4(mix(colorFront, colorBack, noiseOutput), 1.);
}