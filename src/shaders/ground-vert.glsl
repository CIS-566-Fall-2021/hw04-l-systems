#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused

out vec4 fs_Pos;
out vec4 fs_Nor;

float getHeight(vec3 pos){
    return cos(pos.x);
}

void main()
{
    fs_Pos = vs_Pos;
    fs_Nor = vs_Nor;

    mat4 translate = mat4(1.0, 0.0, 0.0, 0.0,
                          0.0, 1.0, 0.0, 0.0,
                          0.0, 0.0, 1.0, 0.0,
                          0.0, -11.0, -20.0, 1.0);
    mat4 scale = mat4(5.0, 0.0, 0.0, 0.0, 
                      0.0, 0.8, 0.0, 0.0,
                      0.0, 0.0, 5.0, 0.0,
                      0.0, 0.0, 0.0, 1.0);

    vec4 pos = translate * scale * vs_Pos;
    pos.y += getHeight(pos.xyz / 10.0);

    gl_Position = u_ViewProj * pos;
}
