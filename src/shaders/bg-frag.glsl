#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;
out vec4 out_Col;

const vec4 lightPos = vec4(5, 5, 3, 1);
const vec4 lightPos2 = vec4(-5, 5, -3, 1);

void main()
{

    float ambientTerm = 0.2;
    float diffuseTerm1 = dot(normalize(fs_Nor), normalize(lightPos - fs_Pos));
    diffuseTerm1 = clamp(diffuseTerm1, 0.f, 1.f);

    float diffuseTerm2 = dot(normalize(fs_Nor), normalize(lightPos2 - fs_Pos));
    diffuseTerm2 = clamp(diffuseTerm2, 0.f, 1.f);

    float lightIntensity = diffuseTerm1 + diffuseTerm2 + ambientTerm;
    lightIntensity = clamp(lightIntensity, 0.f, 1.f);

    // Compute final shaded color
    out_Col = vec4(fs_Col.rgb * lightIntensity, fs_Col.a);
}
