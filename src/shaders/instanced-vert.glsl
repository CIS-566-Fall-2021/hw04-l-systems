#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec4 vs_Trans1;
in vec4 vs_Trans2;
in vec4 vs_Trans3;
in vec4 vs_Trans4;
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;

void main()
{
    fs_Col = vs_Col;

    mat4 transMatrix = mat4(vs_Trans1, vs_Trans2, vs_Trans3, vs_Trans4);

    mat3 invTranspose = mat3(inverse(transpose(transMatrix)));
    fs_Nor = vec4(invTranspose * vec3(vs_Nor), 0); 
    fs_Pos = transMatrix * vs_Pos;
    gl_Position = u_ViewProj * fs_Pos;
}
