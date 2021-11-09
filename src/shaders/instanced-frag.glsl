#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_LightVec;

out vec4 out_Col;

vec4 lightCol = vec4(0.5, 0.7, 0.9, 1.0);

void main()
{
    vec4 diffuseColor = fs_Col;
    // vec4 diffuseColor = mix(lightCol, fs_Col);
    float diffuseTerm = dot(normalize(fs_Nor.xyz), normalize(fs_LightVec.xyz));
    // Avoid negative lighting values
    diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

    float ambientTerm = 0.2;

    float lightIntensity = diffuseTerm + ambientTerm;

    // out_Col = fs_Col;
    out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a);
}
