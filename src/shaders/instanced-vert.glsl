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

//TODO
in vec4 vs_TransVec41;
in vec4 vs_TransVec42;
in vec4 vs_TransVec43;
in vec4 vs_TransVec44;

out vec4 fs_Col;
out vec4 fs_Pos;

//take in in vec4s of the matrix

void main()
{
    //TODO
    mat4 treeTransform = mat4(vs_TransVec41, vs_TransVec42, vs_TransVec43, vs_TransVec44);

    //mat4 treeTransform = mat4();
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;

    vec4 model_position = treeTransform * vs_Pos;

    //vec3 offset = vs_Translate;
    //offset.z = (sin((offset.x) * 3.14159 * 0.1) + cos((offset.y) * 3.14159 * 0.1)) * 1.5;

    //vec3 billboardPos = offset + vs_Pos.x * u_CameraAxes[0] + vs_Pos.y * u_CameraAxes[1];

    gl_Position = u_ViewProj * model_position;//* vec4(billboardPos, 1.0);
}
