#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;

out vec4 out_Col;

void main()
{
    vec3 lightDir = vec3(-1, 0, 0.5);
    //float dist = 1.0 - (length(fs_Pos.xyz) * 2.0);
    float diffuseTerm = dot(normalize(lightDir), normalize(fs_Nor.xyz));
    diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);
    vec3 sunsetCol = vec3(255.0 / 255.0, 143.0 / 255.0, 169.0 / 255.0);
    //sunsetCol = sunsetCol * diffuseTerm;
    diffuseTerm *= diffuseTerm;
    out_Col = /*vec4(diffuseTerm * fs_Col.xyz, 1)*/ vec4((1.0 - diffuseTerm) * fs_Col.xyz + (diffuseTerm) * sunsetCol, 1.0) ;
}
