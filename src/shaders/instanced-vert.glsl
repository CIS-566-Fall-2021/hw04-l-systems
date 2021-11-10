#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec4 vs_Rotate;
in vec3 vs_Scale;
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_LightVec;

const vec4 lightPos = vec4(5., 5., 3., 1.);

mat4 scale() {
    return mat4(vec4(vs_Scale[0], 0, 0, 0.0),
                vec4(0, vs_Scale[1], 0, 0.0), 
                vec4(0, 0, vs_Scale[2], 0.0), 
                vec4(0.0, 0.0, 0.0, 1.0));
}

vec3 transformQuat(vec3 a, vec4 q) {
    normalize(q);
    return a + 2.0*cross(cross(a, q.xyz ) + q.w*a, q.xyz);
}

void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;
    fs_Nor = vs_Nor;
    fs_LightVec = lightPos - vs_Pos;

    vec3 billboardPos = vs_Pos.xyz;
    billboardPos.x = vs_Pos.x * vs_Scale.x / 2.0;
    billboardPos.y = vs_Pos.y * vs_Scale.y;
    billboardPos.z = vs_Pos.z * vs_Scale.z / 2.0;
    billboardPos = transformQuat(billboardPos, vs_Rotate);
    billboardPos = billboardPos + vs_Translate;
    billboardPos.x += billboardPos.y * sin(u_Time / 100.0) * 0.015;

    gl_Position = u_ViewProj * vec4(billboardPos, 1.);
}
