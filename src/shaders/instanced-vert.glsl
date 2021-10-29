#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec4 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec4 vs_Col1;
in vec4 vs_Col2;
in vec4 vs_Col3;
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_LightVec;

void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;
    fs_Nor = vs_Nor;
    mat4 transform;
    //transform[0] = vs_Col1;
    transform[0] = vs_Col1;
    transform[1] = vs_Col2;
    transform[2] = vs_Col3;
    transform[3] = vs_Translate;
    vec4 offset = transform * vs_Pos;
    //offset.z = (sin((u_Time + offset.x) * 3.14159 * 0.1) + cos((u_Time + offset.y) * 3.14159 * 0.1)) * 1.5;

    //vec3 billboardPos = offset.xyz + vs_Pos.x * u_CameraAxes[0] + vs_Pos.y * u_CameraAxes[1];
    fs_LightVec = vec4(25, 30, 3, 1) - offset;
    gl_Position = u_ViewProj * offset;
}
