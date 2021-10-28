#version 300 es
precision highp float;

in vec4 fs_Pos;
in vec4 fs_Nor;

out vec4 out_Col;

void main()
{
    vec4 groundCol = vec4(95.0, 156.0, 114.0, 255.0) / 255.0;
    vec3 lightDir = vec3(-1, 0.5, 0.5);
    float diffuseTerm = dot(normalize(lightDir), normalize(fs_Nor.xyz));
    diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);
    vec3 sunsetCol = vec3(255.0 / 255.0, 143.0 / 255.0, 169.0 / 255.0);
    diffuseTerm *= diffuseTerm;
    out_Col = vec4((1.0 - diffuseTerm) * groundCol.xyz + (diffuseTerm) * sunsetCol, 1.0) ;
    //out_Col = vec4(abs(fs_Nor.xyz), 1.0);
}
