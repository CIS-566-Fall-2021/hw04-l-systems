#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec2 fs_UV;

out vec4 out_Col;
uniform sampler2D u_Texture;

void main()
{

    vec4 diffuseColor = texture(u_Texture, fs_UV);
    float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
    diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);
    float ambientTerm = 0.4;
    float lightIntensity = diffuseTerm + ambientTerm;

    out_Col = vec4(diffuseColor.rgb * lightIntensity, 1.0);
}
