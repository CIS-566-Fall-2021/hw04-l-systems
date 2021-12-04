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

void main()
{
    // pass uv to frag 
    fs_UV = vs_UV;
    // apply scale
    vec3 pos = vs_Pos.xyz*vs_Scale;
    
    // apply quat to pos & normal
    pos = rotate_vertex_position(pos,vs_Quat);
    fs_Nor = vec4(rotate_vertex_position(vs_Nor.xyz,vs_Quat),0.0);

    // apply translation
    vec4 billboardPos = vec4(pos.xyz+vs_Translate,1.0);
    
    fs_Pos = billboardPos;
    
    vec4 lightPos = vec4(10.*sin(u_Time*0.01), 5.*cos(u_Time*0.01), 5.*cos(u_Time*0.02), 1.);
    fs_LightVec = lightPos - fs_Pos;
    gl_Position = u_ViewProj * billboardPos;
}
