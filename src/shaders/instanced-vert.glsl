#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec4 vs_Rotate; //Instance of a noramlized quaternion
in vec3 vs_Scale;
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

out vec4 fs_Col;
out vec4 fs_Pos;    
out vec3 fs_Norm;

//https://community.khronos.org/t/quaternion-functions-for-glsl/50140

vec3 sway(vec3 pos) {
    return vec3(pos.x + (clamp(pos.y - 8., 0., 100.) / 40. * sin(u_Time / 50. + 128.27)), 
                pos.y + (clamp(pos.y - 12., 0., 100.) / 64. * sin(u_Time / 50.)), 
                pos.z + (clamp(pos.y - 8., 0., 100.) / 32. * sin(u_Time / 50. + 21.097)) + 100.);
}

vec3 transformQuat(vec3 a, vec4 q) {
    normalize(q);
    return a + 2.0*cross(cross(a, q.xyz ) + q.w*a, q.xyz);
}

void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;
    fs_Norm = transformQuat(vs_Nor.xyz, vs_Rotate);

    vec3 offset = vs_Translate;
    //vec3 xRot = rotatex(vs_Pos, vs_Rotate.x);
    //offset.z = (sin((u_Time + offset.x) * 3.14159 * 0.1) + cos((u_Time + offset.y) * 3.14159 * 0.1)) * 1.5;

    vec3 billboardPos = vec3(vs_Pos.x * vs_Scale.x, vs_Pos.y * vs_Scale.y, vs_Pos.z * vs_Scale.z);
    billboardPos = transformQuat(billboardPos, vs_Rotate);
    billboardPos = billboardPos + vs_Translate;
    billboardPos = sway(billboardPos) * .1;

    gl_Position = u_ViewProj * vec4(billboardPos, 1.);
}
