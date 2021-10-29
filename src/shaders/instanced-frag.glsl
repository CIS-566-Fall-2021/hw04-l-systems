#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_LightVec;

out vec4 out_Col;

void main()
{
    vec4 diffuseColor = vec4(fs_Col.xyz, 1.0);
    float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
        // Avoid negative lighting values
        // diffuseTerm = clamp(diffuseTerm, 0, 1);

    float ambientTerm = 0.3;

    float lightIntensity = diffuseTerm + ambientTerm;
    //float dist = 1.0 - (length(fs_Pos.xyz) * 2.0);
    out_Col = vec4(diffuseColor.rgb * lightIntensity, 1);
    //out_Col = fs_Col;
}
