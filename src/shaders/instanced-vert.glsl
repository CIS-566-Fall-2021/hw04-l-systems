#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec4 vs_Id; // Id corresponding to mesh

//mat4 that we multiply by vs_Pos to get instances of a base cylinder traveling along our turtle path
in vec4 vs_Transform1;
in vec4 vs_Transform2;
in vec4 vs_Transform3;
in vec4 vs_Transform4;

in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene

in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_LightVec;
out vec2 fs_UV;
out vec4 fs_Id;

// vec2 transformUV()
// {
//     float tex_divs = 5.0;
//     float uv_scale = 1.0 / tex_divs;
//     float cel_y = uv_scale * floor(vs_UVCell * uv_scale);
//     float cel_x = uv_scale * (mod(vs_UVCell, tex_divs));
//     float nextcel_y = uv_scale * floor(vs_UVCell * uv_scale + 1.0);
//     vec2 transformedUV = vs_UV;
//     transformedUV *= uv_scale;
//     transformedUV += vec2(cel_x, cel_y);
    
//     return transformedUV;
// }

void main()
{
    fs_Id = vs_Id;

    fs_UV = vs_UV;
    vec4 lightPos = vec4(0.0, 30.0, 30.0, 1.0);

    fs_Col = vs_Col;
    fs_Pos = vs_Pos;
    mat4 T = mat4(vs_Transform1, vs_Transform2, vs_Transform3, vs_Transform4);
    vec4 finalPos = T * vs_Pos;

    mat3 normalT = inverse(transpose(mat3(T)));
    fs_Nor = vec4(normalT * vec3(vs_Nor), 0);

    fs_LightVec = lightPos - finalPos;
    
    gl_Position = u_ViewProj * finalPos;
}
