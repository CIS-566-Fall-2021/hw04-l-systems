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
in float vs_UVCell;

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;

vec2 transformUV()
{
    float tex_divs = 10.0;
    float uv_scale = 1.0 / tex_divs;
    float cel_y = uv_scale * floor(vs_UVCell * uv_scale);
    float cel_x = uv_scale * (mod(vs_UVCell, tex_divs));
    float nextcel_y = uv_scale * floor(vs_UVCell * uv_scale + 1.0);
    vec2 transformedUV = vs_UV;
    transformedUV *= uv_scale;
    transformedUV += vec2(cel_x, cel_y);
    
    return transformedUV;
}

void main()
{
    fs_UV = transformUV();
    fs_Col = vs_Pos;
    mat4 transform = mat4(vs_TransformX, vs_TransformY, vs_TransformZ, vs_TransformW);
    vec4 modelPos = transform * vec4(vs_Pos.xyz, 1.0);
    
    fs_Pos = modelPos;

    fs_Nor = transform * vs_Nor;
    gl_Position = u_ViewProj * modelPos;
}
