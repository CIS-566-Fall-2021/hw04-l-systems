#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;
uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.
in vec4 vs_Trans1;
in vec4 vs_Trans2;
in vec4 vs_Trans3;
in vec4 vs_Trans4;

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;

const float u_Seed = 1.f;
// Noise function candidate 1 (based on golden ratio)
// From: https://stackoverflow.com/a/28095165
const float PHI = 1.61803398874989484820459;
float randomNoise1(in vec3 xyz, in float seed) {
    return fract(sin(distance(xyz * PHI, xyz)) * xyz.x);
}

float randomNoise2(vec3 p, float seed) {
    return fract(sin(dot(p, vec3(12.9898, -78.233, 133.999)))  * (43758.5453 + seed));
}

float randomNoise3(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

float randomNoise3(vec3 co){
    float noise = randomNoise3(co.xy);
    return randomNoise3(vec2(noise, co.z));
}

float bias(float time, float bias) {
    return (time / ((((1.0 / bias) - 2.0) * (1.0 - time)) + 1.0));
}

float gain(float time, float gain) {
    if (time < 0.5) {
        return bias(time * 2.0, gain) / 2.0;
    } else {
        return bias(time * 2.0 - 1.0, 1.0 - gain) / 2.0 + 0.5;
    }
}

vec3 normalizeNZ(vec3 v) {
    if (v.x == 0.f && v.y == 0.f && v.z == 0.f) {
        return v;
    } else {
        return v;//normalize(v);
    }
}

vec3 getLatticeVector(ivec3 p, float cutoff, float seed) {
    vec3 p2 = vec3(float(p.x), float(p.y), float(p.z));
    float x = -1.f + 2.f * randomNoise2(p2, 1201.f + seed);
    float y = -1.f + 2.f * randomNoise2(p2, 44402.f + seed);
    float z = -1.f + 2.f * randomNoise2(p2, 23103.f + seed);

    return normalizeNZ(vec3(x, y, z));
}

float interpQuintic(float x, float a, float b) {
    float mod = 1.f - 6.f * pow(x, 5.f) + 15.f * pow(x, 4.f) - 10.f * pow(x, 3.f);
    return mix(a, b, 1.f - mod);
}

float interpQuintic3D(vec3 p, float bnl, float bnr, float bfr, float bfl, float tnl, float tnr, float tfr, float tfl) {
    vec3 base = floor(p);
    vec3 diff = p - base;

    float bl = interpQuintic(diff.z, bnl, bfl);
    float br = interpQuintic(diff.z, bnr, bfr);
    float tl = interpQuintic(diff.z, tnl, tfl);
    float tr = interpQuintic(diff.z, tnr, tfr);

    float l = interpQuintic(diff.y, bl, tl);
    float r = interpQuintic(diff.y, br, tr);

    return interpQuintic(diff.x, l, r);
}

const ivec3 bnlv = ivec3(0, 0, 0);
const ivec3 bnrv = ivec3(1, 0, 0);
const ivec3 bfrv = ivec3(1, 0, 1);
const ivec3 bflv = ivec3(0, 0, 1);

const ivec3 tnlv = ivec3(0, 1, 0);
const ivec3 tnrv = ivec3(1, 1, 0);
const ivec3 tfrv = ivec3(1, 1, 1);
const ivec3 tflv = ivec3(0, 1, 1);

const vec3 bnlv2 = vec3(0.f, 0.f, 0.f);
const vec3 bnrv2 = vec3(1.f, 0.f, 0.f);
const vec3 bfrv2 = vec3(1.f, 0.f, 1.f);
const vec3 bflv2 = vec3(0.f, 0.f, 1.f);
const vec3 tnlv2 = vec3(0.f, 1.f, 0.f);
const vec3 tnrv2 = vec3(1.f, 1.f, 0.f);
const vec3 tfrv2 = vec3(1.f, 1.f, 1.f);
const vec3 tflv2 = vec3(0.f, 1.f, 1.f);

const float sqrt3 = 1.732050807568877;
float perlin(vec3 p, float voxelSize, float nonZeroCutoff, float seed) {
    p.x += 100.f;
    p.y += 100.f;
    p.z += 100.f;
    p /= voxelSize;
    vec3 lp2 = floor(p);
    ivec3 lp = ivec3(floor(p.x), floor(p.y), floor(p.z));

    vec3 bnl = getLatticeVector(lp + bnlv, nonZeroCutoff, seed);
    vec3 bnr = getLatticeVector(lp + bnrv, nonZeroCutoff, seed);
    vec3 bfr = getLatticeVector(lp + bfrv, nonZeroCutoff, seed);
    vec3 bfl = getLatticeVector(lp + bflv, nonZeroCutoff, seed);
    vec3 tnl = getLatticeVector(lp + tnlv, nonZeroCutoff, seed);
    vec3 tnr = getLatticeVector(lp + tnrv, nonZeroCutoff, seed);
    vec3 tfr = getLatticeVector(lp + tfrv, nonZeroCutoff, seed);
    vec3 tfl = getLatticeVector(lp + tflv, nonZeroCutoff, seed);

    float dotBnl = dot(normalizeNZ(p - lp2), bnl);
    float dotBnr = dot(normalizeNZ(p - lp2 - bnrv2), bnr);
    float dotBfr = dot(normalizeNZ(p - lp2 - bfrv2), bfr);
    float dotBfl = dot(normalizeNZ(p - lp2 - bflv2), bfl);

    float dotTnl = dot(normalizeNZ(p - lp2 - tnlv2), tnl);
    float dotTnr = dot(normalizeNZ(p - lp2 - tnrv2), tnr);
    float dotTfr = dot(normalizeNZ(p - lp2 - tfrv2), tfr);
    float dotTfl = dot(normalizeNZ(p - lp2 - tflv2), tfl);

    return (sqrt3/2.f + interpQuintic3D(p, dotBnl, dotBnr, dotBfr, dotBfl, dotTnl, dotTnr, dotTfr, dotTfl)) / sqrt3;
}

float fbmPerlin(vec3 p,   // The point in 3D space to get perlin value for
    float voxelSize,      // The size of each voxel in perlin lattice
    float nonZeroCutoff,  // The chance that a given lattice vector is nonzero
    float seed,           // Seed for perlin noise.
    int rounds,           // # of rounds of frequency summation/reconstruction
    float ampDecay,       // Amplitude decay per 'octave'.
    float freqGain) {     // Frequency gain per 'octave'.

    float acc = 0.f;
    float amplitude = 1.f;
    float freq = 0.5f;
    float normC = 0.f;
    for (int round = 0; round < rounds; round++) {
        acc += amplitude * perlin(p * freq, voxelSize, nonZeroCutoff, u_Seed + seed);
        normC += amplitude;
        amplitude *= ampDecay;
        freq *= freqGain;
    }

    return acc / normC;
}

vec3 deformPoint(vec3 p) {
    float noise = 5.f * fbmPerlin(p * 0.1f, 0.48f, 0.f, 1.f, 2, 0.6f, 3.f);
    return p + noise * vec3(0.f, 1.f, 0.f);
}

vec3 transformNormal(vec3 p, vec3 normal) {
    vec3 tangent = normalize(cross(vec3(1.f, 0.f, 0.f), normal));
    vec3 bitangent = normalize(cross(tangent, normal));

    vec3 dp = deformPoint(p);
    vec3 dt = deformPoint(p + 0.001 * tangent);
    vec3 db = deformPoint(p + 0.001 * bitangent);

    return normalize(cross(dp - db, dp - dt));
}

void main()
{
    fs_Col = vec4(196.f/255.f, 164.f/255.f, 132.f/255.f, 1.f);
    mat4 transMatrix = mat4(vs_Trans1, vs_Trans2, vs_Trans3, vs_Trans4);
    vec4 p = transMatrix * vs_Pos;

    fs_Nor = vec4(transformNormal(p.xyz, vec3(0.f, 1.f, 0.f)), 1.f);//vec4(invTranspose * vec3(0.f, 1.f, 0.f), 0); 


    fs_Pos = vec4(deformPoint(p.xyz), 1.f);
    gl_Position = u_ViewProj * fs_Pos;
}
