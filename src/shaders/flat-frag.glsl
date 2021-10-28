#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

// Takes in a position vec3, returns a vec3, to be used below as a color
vec3 noise3D( vec3 p ) 
{
    float val1 = fract(sin((dot(p, vec3(127.1, 311.7, 191.999)))) * 4.5453);

    float val2 = fract(sin((dot(p, vec3(191.999, 127.1, 311.7)))) * 3.5453);

    float val3 = fract(sin((dot(p, vec3(311.7, 191.999, 127.1)))) * 7.5453);

    return vec3(val1, val2, val3);
}

// Interpolate in 3 dimensions
vec3 interpNoise3D(float x, float y, float z) 
{
    int intX = int(floor(x));
    float fractX = fract(x);
    int intY = int(floor(y));
    float fractY = fract(y);
    int intZ = int(floor(z));
    float fractZ = fract(z);

    vec3 v1 = noise3D(vec3(intX, intY, intZ));
    vec3 v2 = noise3D(vec3(intX + 1, intY, intZ));
    vec3 v3 = noise3D(vec3(intX, intY + 1, intZ));
    vec3 v4 = noise3D(vec3(intX + 1, intY + 1, intZ));

    vec3 v5 = noise3D(vec3(intX, intY, intZ + 1));
    vec3 v6 = noise3D(vec3(intX + 1, intY, intZ + 1));
    vec3 v7 = noise3D(vec3(intX, intY + 1, intZ + 1));
    vec3 v8 = noise3D(vec3(intX + 1, intY + 1, intZ + 1));

    vec3 i1 = mix(v1, v2, fractX);
    vec3 i2 = mix(v3, v4, fractX);

    vec3 i3 = mix(i1, i2, fractY);

    vec3 i4 = mix(v5, v6, fractX);
    vec3 i5 = mix(v7, v8, fractX);

    vec3 i6 = mix(i4, i5, fractY);

    vec3 i7 = mix(i3, i6, fractZ);

    return i7;
}

// 3D Fractal Brownian Motion
vec3 fbm(float x, float y, float z, int octaves) 
{
    vec3 total = vec3(0.f, 0.f, 0.f);

    float persistence = 0.5f;

    for(int i = 1; i <= octaves; i++) 
    {
        float freq = pow(3.f, float(i));
        float amp = pow(persistence, float(i));

        total += interpNoise3D(x * freq, y * freq, z * freq) * amp;
    }
    
    return total;
}


void main() 
{
  //out_Col = vec4(0.5 * (fs_Pos + vec2(1.0)), 0.0, 1.0);

  //out_Col = vec4(0.0, 0.0, 0.0, 1.0);

  float eyeComposite = (u_Eye.x + u_Eye.y + u_Eye.z) / 100.0;
  vec3 fbmOut = fbm(fs_Pos.x + eyeComposite, fs_Pos.y, 0.0, 12);
  float greyScale = fbmOut.x / fbmOut.y * fbmOut.z;

  greyScale = pow(greyScale, 0.75);

  out_Col = vec4(greyScale, greyScale, greyScale, 1.0);

  vec4 sunset = vec4(1.0 / fs_Pos[1], 0.3 / fs_Pos[1], 0.0, 1.0);

  if(sunset.y < 0.01)
  {
    out_Col = vec4(0.0, 0.0, 0.0, 1.0);
  }
  else
  {
    out_Col = mix(out_Col, sunset, 1.0 - out_Col.x / 1.25);
  }
}

