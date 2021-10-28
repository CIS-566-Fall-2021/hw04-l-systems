#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

uniform sampler2D u_Texture;

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;

float hash3(vec3 v)
{
    return fract(sin(dot(v, vec3(24.51853, 4815.44774, 32555.33333))) * 3942185.3);
}

vec4 noise3(vec3 v)
{
    //Adapted from IQ: https://www.iquilezles.org/www/articles/morenoise/morenoise.htm
    vec3 intV = floor(v);
    vec3 fractV = fract(v);
    vec3 u = fractV*fractV*fractV*(fractV*(fractV*6.0-15.0)+10.0);
    vec3 du = 30.0*fractV*fractV*(fractV*(fractV-2.0)+1.0);
    
    float a = hash3( intV+vec3(0.f,0.f,0.f) );
    float b = hash3( intV+vec3(1.f,0.f,0.f) );
    float c = hash3( intV+vec3(0.f,1.f,0.f) );
    float d = hash3( intV+vec3(1.f,1.f,0.f) );
    float e = hash3( intV+vec3(0.f,0.f,1.f) );
    float f = hash3( intV+vec3(1.f,0.f,1.f) );
    float g = hash3( intV+vec3(0.f,1.f,1.f) );
    float h = hash3( intV+vec3(1.f,1.f,1.f) );
    
    float k0 =   a;
    float k1 =   b - a;
    float k2 =   c - a;
    float k3 =   e - a;
    float k4 =   a - b - c + d;
    float k5 =   a - c - e + g;
    float k6 =   a - b - e + f;
    float k7 = - a + b + c - d + e - f - g + h;
    
    
    vec3 dv = 2.0* du * vec3( k1 + k4*u.y + k6*u.z + k7*u.y*u.z,
                             k2 + k5*u.z + k4*u.x + k7*u.z*u.x,
                             k3 + k6*u.x + k5*u.y + k7*u.x*u.y);
    
    return vec4(-1.f+2.f*(k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z), dv);
}

vec4 fbm3(vec3 v, int octaves, float amp, float freq, float pers, float freq_power)
{
    float sum = 0.f;
    vec3 dv = vec3(0.f,0.f,0.f);
    float speed = 0.01f;
    for(int i = 0; i < octaves; ++i)
    {
        amp *= pers;
        freq *= freq_power;
        vec4 noise = noise3((v) * freq);
        sum += amp * noise.x;
        dv += amp * noise.yzw;
    }
    return vec4(sum, dv);
}

float sdPlane( vec3 p, vec3 n, float h )
{
  // n must be normalized
  return dot(p,n) + h;
}

float map(vec3 p)
{
    return sdPlane(p, vec3(0.0, 1.0, 0.0), -4.0);
}

vec4 raycast(vec3 origin, vec3 dir, int maxSteps)
{
    float t = 0.0;

    for(int i = 0; i < maxSteps; ++i)
    {
        vec3 p = origin + t * dir;
        float dist = map(p);

        if (abs(dist) < 0.001) {
            return vec4(p, 0.0);
        }
        
        t += dist;
        if(t > 60.0) {
            return vec4(0.0,0.0,0.0, -100.0);
        }
    }
    
    return vec4(0.0,0.0, 0.0, -100.0);
}

void main() {

    float fov = 22.5f;
    float len = distance(u_Ref, u_Eye);
    vec3 look = normalize(u_Ref - u_Eye);
    vec3 right = normalize(cross(look, u_Up));
    float aspect = u_Dimensions.x / u_Dimensions.y;
    vec3 v = u_Up * len * tan(fov);
    vec3 h = right * len * aspect * tan(fov);

    vec3 p = u_Ref + fs_Pos.x * h + fs_Pos.y * v;
    vec3 dir = normalize(p - u_Eye);
    vec2 uv = 0.5 * (fs_Pos.xy + vec2(1.0, 1.0));
    uv.y = 1.0 - uv.y;
    
    float modTime = mod(u_Time * 0.002, 1000.0);
    vec4 noise = fbm3(modTime + fs_Pos.xyy, 4, 0.9, 1.0, 0.5, 2.0);
    uv.y += noise.x * 0.2;
    
    out_Col = vec4(0.73, 0.70, 0.6, 1.0);
    
    vec4 col = texture(u_Texture, uv);
    
    out_Col = vec4(col.xyz, 1.0);
    
    /*vec4 isect = raycast(u_Eye, dir, 120);
    
    if(isect.w > -1.0) {
        out_Col = vec4(0.0,0.0,0.0,1.0);
    }*/
   // out_Col.xy = uv;
}
