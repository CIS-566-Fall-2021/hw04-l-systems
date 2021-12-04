#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;
uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

// instanced input
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec4 vs_Quat;
in vec3 vs_Scale;

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;
out vec2 fs_UV;
out vec4 fs_LightVec;   
vec3 rotate_vertex_position(vec3 position, vec4 q)
{ 
  vec3 v = position;
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

#define NUM_OCTAVES 5

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}


float fbm(vec3 x) {
	float v = 0.0;
	float a = 0.5;
	vec3 shift = vec3(100);
	for (int i = 0; i < NUM_OCTAVES; ++i) {
		v += a * noise(x);
		x = x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}


void main()
{
    // pass uv to frag 
    fs_UV = vs_UV;
    // apply scale
    vec3 pos = vs_Pos.xyz*vs_Scale;
    vec3 n = vec3(0,0,0.4*pos.y*fbm(pos)*(sin(u_Time*0.04)+cos(u_Time*0.02)));
    // apply quat to pos & normal
    pos = pos + n;
    pos = rotate_vertex_position(pos,vs_Quat);
    fs_Nor = vec4(rotate_vertex_position(vs_Nor.xyz,vs_Quat),0.0);

    // apply translation
    vec4 billboardPos = vec4(pos.xyz+vs_Translate,1.0);
    
    fs_Pos = billboardPos;
    
    vec4 lightPos = vec4(10.*sin(u_Time*0.01), 5.*cos(u_Time*0.01), 5.*cos(u_Time*0.02), 1.);
    fs_LightVec = lightPos - fs_Pos;
    gl_Position = u_ViewProj * billboardPos;
}
