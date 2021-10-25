#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene

in vec3 vs_Rotate; // Another instance rendering attribute used to position each quad instance in the scene

in vec3 vs_Scale; // Another instance rendering attribute used to position each quad instance in the scene

in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

out vec2 fs_UV;

in vec4 vs_TransformX;
in vec4 vs_TransformY;
in vec4 vs_TransformZ;
in vec4 vs_TransformW;

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;

void main()
{
    fs_UV = vs_UV;
    fs_Col = vs_Pos;
    mat4 transform = mat4(vs_TransformX, vs_TransformY, vs_TransformZ, vs_TransformW);
    vec4 modelPos = transform * vec4(vs_Pos.xyz, 1.0);
    
    fs_Pos = modelPos;

    fs_Nor = transform * vs_Nor;
    gl_Position = u_ViewProj * modelPos;
}
