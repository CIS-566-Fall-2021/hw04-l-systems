#version 300 es
precision highp float;

in vec4 fs_Nor;
in vec4 fs_Col;
in vec4 fs_Pos;

out vec4 out_Col;

// Lambert Reflection
void main()
{
    vec3 lightCol = vec3(0.95, 0.87, 0.89);
    vec3 lightVec = normalize(vec3(3., 1., 3.));

    float diffuseTerm = clamp(dot(normalize(fs_Nor.xyz), lightVec), 0., 1.);

    vec4 color = fs_Col * vec4(diffuseTerm * lightCol, 1.0);

    out_Col = color;
}
