#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec3 fs_Norm;

out vec4 out_Col;

const vec4 lightPos = vec4(10., 10., 3., 1);

void main()
{
    float diffuseTerm = clamp(dot(normalize(fs_Norm), normalize(lightPos.xyz)), 0., 1.);
    float dist = 1.0 - (length(fs_Pos.xyz) * 2.0);
    float lightIntensity = diffuseTerm + 0.3;
    out_Col = vec4(vec3(clamp(fs_Col * lightIntensity, 0.0, 1.0)), 1.);
}
