#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;

out vec4 out_Col;

void main()
{
    vec3 lightPos = vec3(2.0, 1.0, 4.0);
    float LamberShading = max(dot(normalize(fs_Nor.xyz), normalize(lightPos)), 0.0);
    vec4 col = vec4(vec3(1.0) * LamberShading, 1.0);
    out_Col = col * fs_Col;
}
