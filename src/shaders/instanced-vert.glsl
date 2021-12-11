#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.
in vec4 vs_T1;
in vec4 vs_T2;
in vec4 vs_T3;
in vec4 vs_T4;

out vec4 fs_Col;
out vec4 fs_Pos;

void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;

    //vec3 offset = vs_Translate;
    mat4 t = mat4(vs_T1, vs_T2, vs_T3, vs_T4);
    //t = transpose(t);

    vec4 newPos = t * vs_Pos;
    //offset.z = (sin((u_Time + offset.x) * 3.14159 * 0.1) + cos((u_Time + offset.y) * 3.14159 * 0.1)) * 1.5;

    gl_Position = u_ViewProj * newPos;
}
